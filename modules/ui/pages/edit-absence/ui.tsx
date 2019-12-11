import { Typography } from "@material-ui/core";
import {
  eachDayOfInterval,
  format,
  formatISO,
  isDate,
  isEqual,
  isSameDay,
  isValid,
  parseISO,
} from "date-fns";
import { startOfMonth } from "date-fns/esm";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import {
  AbsenceDetailCreateInput,
  AbsenceUpdateInput,
  AbsenceVacancyInput,
  DayPart,
  NeedsReplacement,
  Vacancy,
} from "graphql/server-types.gen";
import {
  AbsenceReasonUsageData,
  computeAbsenceUsageText,
} from "helpers/absence/computeAbsenceUsageText";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import { convertStringToDate, isAfterDate } from "helpers/date";
import { parseTimeFromString, secondsSinceMidnight } from "helpers/time";
import { useQueryParamIso } from "hooks/query-params";
import { useSnackbar } from "hooks/use-snackbar";
import { compact, differenceWith, flatMap } from "lodash-es";
import * as React from "react";
import { useCallback, useMemo, useReducer, useState } from "react";
import useForm from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AbsenceDetails } from "ui/components/absence/absence-details";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { EditVacancies } from "../create-absence/edit-vacancies";
import { GetProjectedAbsenceUsage } from "../create-absence/graphql/get-projected-absence-usage.gen";
import { GetProjectedVacancies } from "../create-absence/graphql/get-projected-vacancies.gen";
import { projectVacancyDetails } from "../create-absence/project-vacancy-details";
import { VacancyDetail } from "../create-absence/types";
import { buildAbsenceCreateInput } from "../create-absence/ui";
import { UpdateAbsence } from "./graphql/update-absence.gen";
import { editAbsenceReducer, EditAbsenceState } from "./state";
import { StepParams } from "./step-params";
import { AssignSub } from "../create-absence/assign-sub";

type Props = {
  firstName: string;
  lastName: string;
  employeeId: string;
  actingAsEmployee?: boolean;
  organizationId: string;
  needsReplacement: NeedsReplacement;
  userIsAdmin: boolean;
  positionId: string;
  positionName?: string;
  absenceReasonId: number;
  absenceId: string;
  startDate: string;
  endDate: string;
  dayPart?: DayPart;
  initialVacancyDetails: VacancyDetail[];
  initialVacancies: Vacancy[];
  initialAbsenceUsageData: AbsenceReasonUsageData[];
  rowVersion: string;
  absenceDetailsIdsByDate: Record<string, string>;
  replacementEmployeeId?: number;
  replacementEmployeeName?: string;
};

type EditAbsenceFormData = {
  startDate: Date;
  endDate: Date;
  absenceReason: string;
  dayPart?: DayPart;
  hourlyStartTime?: Date;
  hourlyEndTime?: Date;
  notesToApprover?: string;
  notesToReplacement?: string;
  replacementEmployeeId?: number;
  replacementEmployeeName?: string;
  vacancies?: AbsenceVacancyInput[];
  accountingCode?: string;
  payCode?: string;
};

export const EditAbsenceUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const [step, setStep] = useQueryParamIso(StepParams);
  const [state, dispatch] = useReducer(editAbsenceReducer, props, initialState);

  const [customizedVacancyDetails, setVacanciesInput] = useState<
    VacancyDetail[]
  >();

  const [updateAbsence] = useMutationBundle(UpdateAbsence, {});
  const { openSnackbar } = useSnackbar();

  const name = `${props.firstName} ${props.lastName}`;

  const initialFormData: EditAbsenceFormData = {
    startDate: parseISO(props.startDate),
    endDate: parseISO(props.endDate),
    absenceReason: props.absenceReasonId.toString(),
    replacementEmployeeId: props.replacementEmployeeId,
    replacementEmployeeName: props.replacementEmployeeName,
    dayPart: props.dayPart,
    payCode:
      // @ts-ignore
      props.initialVacancies[0]?.details[0]?.payCodeId?.toString() ?? undefined,
    accountingCode:
      // @ts-ignore
      props.initialVacancies[0]?.details[0]?.accountingCodeAllocations[0]?.accountingCode?.id?.toString() ??
      undefined,
  };

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    errors,
    triggerValidation,
  } = useForm<EditAbsenceFormData>({
    defaultValues: initialFormData,
  });

  const formValues = getValues();
  const required = t("Required");
  register({ name: "dayPart", type: "custom" }, { required });
  register({ name: "absenceReason", type: "custom" }, { required });
  register({ name: "startDate", type: "custom" }, { required });
  register({ name: "endDate", type: "custom" });
  register({ name: "needsReplacement", type: "custom" });
  register({ name: "notesToApprover", type: "custom" });
  register({ name: "notesToReplacement", type: "custom" });
  register({ name: "replacementEmployeeId", type: "custom" });
  register({ name: "replacementEmployeeName", type: "custom" });
  register(
    { name: "hourlyStartTime", type: "custom" },
    {
      validate: value =>
        formValues.dayPart !== DayPart.Hourly ||
        value ||
        t("Start time is required"),
    }
  );
  register(
    { name: "hourlyEndTime", type: "custom" },
    {
      validate: value =>
        formValues.dayPart !== DayPart.Hourly ||
        value ||
        t("End time is required"),
    }
  );
  register({ name: "accountingCode", type: "custom" });
  register({ name: "payCode", type: "custom" });

  const useProjectedInformation =
    customizedVacancyDetails ||
    !isSameDay(parseISO(props.startDate), formValues.startDate) ||
    !isSameDay(parseISO(props.endDate), formValues.endDate) ||
    formValues.dayPart !== props.dayPart ||
    state.needsReplacement !== props.initialVacancies.length > 0;

  const disabledDatesQuery = useEmployeeDisabledDates(
    state.employeeId,
    state.viewingCalendarMonth
  );

  /* We are going to presume that any dates that exist within the original absence
     can still be selected, regardless of why they may presently exist in the disabledDates.
     (hopefully this is simply because the absence itself exists)
   */
  const disabledDates = useMemo(() => {
    const start = parseISO(props.startDate);
    const end = parseISO(props.endDate);
    const absenceDays = eachDayOfInterval({ start, end });
    const remaining = differenceWith(
      disabledDatesQuery,
      absenceDays,
      isSameDay
    );
    return remaining;
  }, [disabledDatesQuery, props.startDate, props.endDate]);

  const projectedVacanciesInput = useMemo(
    () =>
      buildAbsenceCreateInput(
        formValues,
        Number(props.organizationId),
        Number(state.employeeId),
        Number(props.positionId),
        disabledDates,
        customizedVacancyDetails !== undefined,
        { ...state, organizationId: props.organizationId },
        customizedVacancyDetails
      ),
    [
      formValues.startDate,
      formValues.endDate,
      formValues.absenceReason,
      formValues.dayPart,
      formValues.hourlyStartTime,
      formValues.hourlyEndTime,
      customizedVacancyDetails,
      state,
      props.positionId,
      disabledDates,
    ]
  );

  const getProjectedVacancies = useQueryBundle(GetProjectedVacancies, {
    variables: {
      absence: projectedVacanciesInput!,
      ignoreAbsenceId: Number(props.absenceId),
    },
    skip: !useProjectedInformation || projectedVacanciesInput === null,
    onError: () => {},
  });

  const getProjectedAbsenceUsage = useQueryBundle(GetProjectedAbsenceUsage, {
    variables: {
      absence: projectedVacanciesInput!,
      ignoreAbsenceId: Number(props.absenceId),
    },
    skip: !useProjectedInformation || projectedVacanciesInput === null,
    // fetchPolicy: "no-cache",
    onError: () => {
      // This shouldn't prevent the User from continuing on
      // with Absence Create. Any major issues will be caught
      // and reported back to them when calling the Create mutation.
    },
  });

  const absenceUsageText = useMemo(() => {
    if (
      getProjectedAbsenceUsage.state === "DONE" ||
      getProjectedAbsenceUsage.state === "UPDATING"
    ) {
      const usages = compact(
        flatMap(
          getProjectedAbsenceUsage.data.absence?.projectedAbsence?.details,
          d => d?.reasonUsages?.map(ru => ru)
        )
      );
      return computeAbsenceUsageText(usages as any, t);
    } else {
      return computeAbsenceUsageText(props.initialAbsenceUsageData, t);
    }
  }, [getProjectedAbsenceUsage]);

  const projectedVacancies =
    getProjectedVacancies.state === "DONE" ||
    getProjectedVacancies.state === "UPDATING"
      ? (compact(
          getProjectedVacancies.data?.absence?.projectedVacancies ?? []
        ) as Vacancy[])
      : null;

  const onChangedVacancies = useCallback(
    (vacancyDetails: VacancyDetail[]) => {
      setStep("absence");
      setVacanciesInput(vacancyDetails);
    },
    [setVacanciesInput, setStep]
  );
  const onCancel = useCallback(() => setStep("absence"), [setStep]);

  const projectedVacancyDetails: VacancyDetail[] = useMemo(
    () => projectVacancyDetails(getProjectedVacancies),
    [getProjectedVacancies.state]
  );

  const theVacancyDetails: VacancyDetail[] =
    customizedVacancyDetails ||
    (useProjectedInformation && projectedVacancyDetails) ||
    props.initialVacancyDetails;

  return (
    <>
      <PageTitle title={t("Edit Absence")} withoutHeading />

      {step === "absence" && (
        <form
          onSubmit={handleSubmit(async data => {
            const absenceUpdateInput = buildAbsenceUpdateInput(
              props.absenceId,
              props.positionId,
              props.rowVersion,
              props.absenceDetailsIdsByDate,
              formValues,
              disabledDates,
              state,
              theVacancyDetails
            );
            console.log(
              "submit edit data",
              absenceUpdateInput,
              data,
              theVacancyDetails
            );
            await updateAbsence({ variables: { absence: absenceUpdateInput } });
            openSnackbar({
              message: t("The absence has been updated"),
              dismissable: true,
              status: "success",
              autoHideDuration: 5000,
            });
          })}
        >
          {props.actingAsEmployee ? (
            <Typography variant="h1">{t("Edit absence")}</Typography>
          ) : (
            <>
              <Typography variant="h5">{t("Edit absence")}</Typography>
              <Typography variant="h1">{name}</Typography>
            </>
          )}

          <Section>
            <AbsenceDetails
              saveLabel={t("Save")}
              setStep={setStep}
              disabledDates={disabledDates}
              isAdmin={props.userIsAdmin}
              needsReplacement={props.needsReplacement}
              wantsReplacement={state.needsReplacement}
              organizationId={props.organizationId}
              onSwitchMonth={d => dispatch({ action: "switchMonth", month: d })}
              onSubstituteWantedChange={subWanted =>
                dispatch({ action: "setNeedsReplacement", to: subWanted })
              }
              values={formValues}
              setValue={setValue}
              errors={{}}
              triggerValidation={triggerValidation}
              vacancies={projectedVacancies || props.initialVacancies}
              balanceUsageText={absenceUsageText ?? undefined}
              setVacanciesInput={setVacanciesInput}
            />
          </Section>
        </form>
      )}
      {step === "edit" && (
        <EditVacancies
          actingAsEmployee={props.actingAsEmployee}
          employeeName={name}
          positionName={props.positionName}
          onCancel={onCancel}
          details={theVacancyDetails}
          onChangedVacancies={onChangedVacancies}
          employeeId={props.employeeId}
        />
      )}
      {step === "preAssignSub" && (
        <AssignSub
          employeeName={name}
          orgId={props.organizationId}
          vacancies={projectedVacancies || props.initialVacancies}
          userIsAdmin={props.userIsAdmin}
          employeeId={props.employeeId}
          positionId={props.positionId}
          positionName={props.positionName}
          setStep={setStep}
          setValue={setValue}
        />
      )}
    </>
  );
};

const initialState = (props: Props): EditAbsenceState => ({
  employeeId: props.employeeId,
  absenceId: props.absenceId,
  viewingCalendarMonth: startOfMonth(parseISO(props.startDate)),
  needsReplacement: props.needsReplacement !== NeedsReplacement.No,
});

const buildAbsenceUpdateInput = (
  absenceId: string,
  positionId: string,
  rowVersion: string,
  absenceDetailsIdsByDate: Record<string, string>,
  formValues: EditAbsenceFormData,
  disabledDates: Date[],
  state: EditAbsenceState,
  vacancyDetails: VacancyDetail[]
): AbsenceUpdateInput => {
  const startDate =
    typeof formValues.startDate === "string"
      ? new Date(formValues.startDate)
      : formValues.startDate;
  let endDate =
    typeof formValues.endDate === "string"
      ? new Date(formValues.endDate)
      : formValues.endDate;

  // If we don't have an end date, set it to the start date
  // Assuming a single day absence as of this point
  if (!endDate) {
    endDate = startDate;
  }

  if (
    !isDate(startDate) ||
    !isValid(startDate) ||
    !isDate(endDate) ||
    !isValid(endDate)
  ) {
    throw Error("invalid start/end date");
  }

  // Ensure the end date is after the start date or they are equal
  if (!isEqual(startDate, endDate) && !isAfterDate(endDate, startDate)) {
    throw Error("invalid start/end date");
  }

  const dates = differenceWith(
    eachDayOfInterval({ start: startDate, end: endDate }),
    disabledDates,
    (a, b) => isEqual(a, b)
  );

  const vDetails =
    vacancyDetails?.map(v => ({
      ...v,
      startTime: secondsSinceMidnight(
        parseTimeFromString(format(convertStringToDate(v.startTime)!, "h:mm a"))
      ),
      endTime: secondsSinceMidnight(
        parseTimeFromString(format(convertStringToDate(v.endTime)!, "h:mm a"))
      ),
    })) || undefined;

  let absence: AbsenceUpdateInput = {
    id: Number(absenceId),
    rowVersion,
    notesToApprover: formValues.notesToApprover,
    details: dates.map(d => {
      const formattedDate = formatISO(d, { representation: "date" });
      const previousId = absenceDetailsIdsByDate[formattedDate];
      let detail: AbsenceDetailCreateInput = {
        date: formattedDate,
        id: previousId ? Number(previousId) : null,
        dayPartId: formValues.dayPart,
        reasons: [{ absenceReasonId: Number(formValues.absenceReason) }],
      };

      if (formValues.dayPart === DayPart.Hourly) {
        detail = {
          ...detail,
          startTime: secondsSinceMidnight(
            parseTimeFromString(format(formValues.hourlyStartTime!, "h:mm a"))
          ),
          endTime: secondsSinceMidnight(
            parseTimeFromString(format(formValues.hourlyEndTime!, "h:mm a"))
          ),
        };
      }

      return detail;
    }),
    vacancies: [
      {
        positionId: Number(positionId),
        useSuppliedDetails: true,
        needsReplacement: state.needsReplacement,
        notesToReplacement: formValues.notesToReplacement,
        prearrangedReplacementEmployeeId:
          formValues.replacementEmployeeId || null,
        details: vDetails,
        accountingCodeAllocations: formValues.accountingCode
          ? [
              {
                accountingCodeId: Number(formValues.accountingCode),
                allocation: 1.0,
              },
            ]
          : undefined,
        payCodeId: formValues.payCode ? Number(formValues.payCode) : undefined,
      },
    ],
  };

  return absence;
};

import { Typography } from "@material-ui/core";
import {
  NeedsReplacement,
  DayPart,
  AbsenceVacancyInput,
  Vacancy,
} from "graphql/server-types.gen";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { useQueryParamIso } from "hooks/query-params";
import { StepParams } from "./step-params";
import { EditAbsenceState, editAbsenceReducer } from "./state";
import { useReducer, useMemo, useState, useCallback } from "react";
import { startOfMonth } from "date-fns/esm";
import { useQueryBundle } from "graphql/hooks";
import {
  format,
  endOfMonth,
  addMonths,
  parseISO,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import { AbsenceDetails } from "ui/components/absence/absence-details";
import useForm from "react-hook-form";
import { VacancyDetail } from "../create-absence/types";
import { buildAbsenceCreateInput } from "../create-absence/ui";
import { GetProjectedVacancies } from "../create-absence/graphql/get-projected-vacancies.gen";
import { GetProjectedAbsenceUsage } from "../create-absence/graphql/get-projected-absence-usage.gen";
import { EditVacancies } from "../create-absence/edit-vacancies";
import { differenceWith, compact, flatMap } from "lodash-es";
import {
  AbsenceReasonUsageData,
  computeAbsenceUsageText,
} from "helpers/absence/computeAbsenceUsageText";

type Props = {
  firstName: string;
  lastName: string;
  employeeId: string;
  actingAsEmployee?: boolean;
  organizationId: string;
  needsReplacement: NeedsReplacement;
  userIsAdmin: boolean;
  positionId?: string;
  positionName?: string;
  absenceReasonId: number;
  absenceId: string;
  startDate: string;
  endDate: string;
  dayPart?: DayPart;
  initialVacancyDetails: VacancyDetail[];
  initialVacancies: Vacancy[];
  initialAbsenceUsageData: AbsenceReasonUsageData[];
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

  const [vacanciesInput, setVacanciesInput] = useState<VacancyDetail[]>();

  const name = `${props.firstName} ${props.lastName}`;

  const initialFormData: EditAbsenceFormData = {
    startDate: parseISO(props.startDate),
    endDate: parseISO(props.endDate),
    absenceReason: props.absenceReasonId.toString(),
    dayPart: props.dayPart,
    payCode:
      // @ts-ignore
      props.initialVacancies[0]?.details[0]?.payCodeId?.toString() ?? undefined,
    accountingCode:
      // @ts-ignore
      props.initialVacancies[0]?.details[0]?.accountingCodeAllocations[0]?.accountingCodeId.toString() ??
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
    vacanciesInput ||
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
        vacanciesInput !== undefined,
        { ...state, organizationId: props.organizationId },
        vacanciesInput
      ),
    [
      formValues.startDate,
      formValues.endDate,
      formValues.absenceReason,
      formValues.dayPart,
      formValues.hourlyStartTime,
      formValues.hourlyEndTime,
      vacanciesInput,
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
      console.log("got vacancy details?", vacancyDetails);
      setVacanciesInput(vacancyDetails);
    },
    [setVacanciesInput, setStep]
  );
  const onCancel = useCallback(() => setStep("absence"), [setStep]);

  const theVacancyDetails: VacancyDetail[] =
    vacanciesInput || props.initialVacancyDetails;
  console.log("theVacancyDetails", theVacancyDetails);

  return (
    <>
      <PageTitle title={t("Edit Absence")} withoutHeading />

      {step === "absence" && (
        <form
          onSubmit={handleSubmit(async data => {
            console.log("submit edit data", data);
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
    </>
  );
};

const initialState = (props: Props): EditAbsenceState => ({
  employeeId: props.employeeId,
  absenceId: props.absenceId,
  viewingCalendarMonth: startOfMonth(parseISO(props.startDate)),
  needsReplacement: props.needsReplacement !== NeedsReplacement.No,
});

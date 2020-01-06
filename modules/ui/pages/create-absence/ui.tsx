import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import {
  format,
  isBefore,
  isSameDay,
  min,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { useForm } from "forms";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import {
  Absence,
  AbsenceCreateInput,
  AbsenceDetailCreateInput,
  AbsenceVacancyInput,
  DayPart,
  NeedsReplacement,
  Vacancy,
} from "graphql/server-types.gen";
import { computeAbsenceUsageText } from "helpers/absence/computeAbsenceUsageText";
import { DisabledDate } from "helpers/absence/computeDisabledDates";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import { convertStringToDate } from "helpers/date";
import { parseTimeFromString, secondsSinceMidnight } from "helpers/time";
import { useQueryParamIso } from "hooks/query-params";
import { useDialog } from "hooks/use-dialog";
import { compact, differenceWith, flatMap, isEmpty, some } from "lodash-es";
import * as React from "react";
import { useCallback, useMemo, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { AbsenceDetails } from "ui/components/absence/absence-details";
import { TranslateAbsenceErrorCodeToMessage } from "ui/components/absence/helpers";
import { ShowIgnoreAndContinueOrError } from "ui/components/error-helpers";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { VacancyDetail } from "../../components/absence/types";
import { AssignSub } from "./assign-sub/index";
import { Confirmation } from "./confirmation";
import { EditVacancies } from "./edit-vacancies";
import { CreateAbsence } from "./graphql/create.gen";
import { GetProjectedAbsenceUsage } from "./graphql/get-projected-absence-usage.gen";
import { GetProjectedVacancies } from "./graphql/get-projected-vacancies.gen";
import { projectVacancyDetails } from "./project-vacancy-details";
import { createAbsenceReducer, CreateAbsenceState } from "./state";
import { StepParams } from "./step-params";

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
  locationIds?: number[];
  initialAbsenceReason?: string;
  initialDates?: Date[];
  initialDayPart?: DayPart;
  initialStartHour?: Date;
  initialEndHour?: Date;
  initialNeedsReplacement?: boolean;
};

export const CreateAbsenceUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openDialog } = useDialog();
  const [absence, setAbsence] = useState<Absence>();
  const [step, setStep] = useQueryParamIso(StepParams);

  const [state, dispatch] = useReducer(
    createAbsenceReducer,
    props,
    initialState
  );
  const setVacanciesInput: (
    i: undefined | VacancyDetail[]
  ) => void = useCallback(
    i =>
      dispatch({
        action: "setVacanciesInput",
        input: i,
      }),
    [dispatch]
  );
  const initialFormData: CreateAbsenceFormData = {
    absenceReason: props.initialAbsenceReason || "",
    dayPart: props.initialDayPart,
    hourlyStartTime: props.initialStartHour,
    hourlyEndTime: props.initialEndHour,
  };

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    errors,
    triggerValidation,
  } = useForm<CreateAbsenceFormData>({
    defaultValues: initialFormData,
  });

  const formValues = getValues();

  const [createAbsence] = useMutationBundle(CreateAbsence, {
    onError: error => {
      ShowIgnoreAndContinueOrError(
        error,
        openDialog,
        t("There was an issue creating the absence"),
        async () => await create(formValues, true),
        t,
        TranslateAbsenceErrorCodeToMessage
      );
    },
  });

  const required = t("Required");
  register({ name: "dayPart", type: "custom" }, { required });
  register({ name: "absenceReason", type: "custom" }, { required });
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

  const disabledDates = useEmployeeDisabledDates(
    state.employeeId,
    state.viewingCalendarMonth
  );
  React.useEffect(() => {
    const conflictingDates = disabledDates
      .map(dis => dis.date)
      .filter(dis => some(state.absenceDates, ad => isSameDay(ad, dis)));
    if (conflictingDates.length > 0) {
      dispatch({ action: "removeAbsenceDates", dates: conflictingDates });
    }
  }, [disabledDates]);

  const projectedVacanciesInput = useMemo(
    () =>
      buildAbsenceCreateInput(
        state.absenceDates,
        formValues,
        Number(state.organizationId),
        Number(state.employeeId),
        Number(props.positionId),
        disabledDates,
        state.needsReplacement,
        state.vacanciesInput
      ),
    [
      state.absenceDates,
      formValues.absenceReason,
      formValues.dayPart,
      formValues.hourlyStartTime,
      formValues.hourlyEndTime,
      state.vacanciesInput,
      state.needsReplacement,
    ]
  );

  const getProjectedVacancies = useQueryBundle(GetProjectedVacancies, {
    variables: {
      absence: {
        ...projectedVacanciesInput!,
        ignoreWarnings: true,
      },
    },
    skip: projectedVacanciesInput === null,
    onError: () => {},
  });

  const getProjectedAbsenceUsage = useQueryBundle(GetProjectedAbsenceUsage, {
    variables: {
      absence: {
        ...projectedVacanciesInput!,
        ignoreWarnings: true,
      },
    },
    skip: projectedVacanciesInput === null,
    // fetchPolicy: "no-cache",
    onError: () => {
      // This shouldn't prevent the User from continuing on
      // with Absence Create. Any major issues will be caught
      // and reported back to them when calling the Create mutation.
    },
  });

  const projectedVacancyDetails: VacancyDetail[] = useMemo(
    () => projectVacancyDetails(getProjectedVacancies),
    [getProjectedVacancies.state]
  );

  const theVacancyDetails: VacancyDetail[] =
    state.vacanciesInput || projectedVacancyDetails;

  const projectedVacancies =
    getProjectedVacancies.state === "LOADING" ||
    getProjectedVacancies.state === "UPDATING"
      ? []
      : (compact(
          getProjectedVacancies.data?.absence?.projectedVacancies ?? []
        ) as Vacancy[]);

  const absenceUsageText = useMemo(() => {
    if (
      !(
        getProjectedAbsenceUsage.state === "DONE" ||
        getProjectedAbsenceUsage.state === "UPDATING"
      )
    )
      return null;

    const usages = compact(
      flatMap(
        getProjectedAbsenceUsage.data.absence?.projectedAbsence?.details,
        d => d?.reasonUsages?.map(ru => ru)
      )
    );
    return computeAbsenceUsageText(usages as any, t);
  }, [getProjectedVacancies]);

  const name = `${props.firstName} ${props.lastName}`;

  const create = async (
    formValues: CreateAbsenceFormData,
    ignoreWarnings?: boolean
  ) => {
    let absenceCreateInput = buildAbsenceCreateInput(
      state.absenceDates,
      formValues,
      Number(state.organizationId),
      Number(state.employeeId),
      Number(props.positionId),
      disabledDates,
      state.needsReplacement,
      theVacancyDetails
    );
    if (!absenceCreateInput) {
      return;
    }

    if (ignoreWarnings) {
      absenceCreateInput = {
        ...absenceCreateInput,
        ignoreWarnings: true,
      };
    }

    const result = await createAbsence({
      variables: {
        absence: absenceCreateInput,
      },
    });

    const absence = result?.data?.absence?.create as Absence;
    if (absence) {
      setAbsence(absence);
      setStep("confirmation");
    }
  };

  const onChangedVacancies = React.useCallback(
    (vacancyDetails: VacancyDetail[]) => {
      setStep("absence");
      setVacanciesInput(vacancyDetails);
    },
    [setVacanciesInput, setStep]
  );
  const onCancel = React.useCallback(() => setStep("absence"), [setStep]);

  const onAssignSub = React.useCallback(
    (replacementId: number, replacementName: string) => {
      /* eslint-disable @typescript-eslint/no-floating-promises */
      setValue("replacementEmployeeId", replacementId);
      setValue("replacementEmployeeName", replacementName);
      /* eslint-enable @typescript-eslint/no-floating-promises */
      setStep("absence");
    },
    [setStep, setValue]
  );

  const removePrearrangedReplacementEmployee = React.useCallback(async () => {
    await setValue("replacementEmployeeId", undefined);
    await setValue("replacementEmployeeName", undefined);
  }, [setValue]);

  return (
    <>
      <PageTitle title={t("Create absence")} withoutHeading />

      <form
        onSubmit={handleSubmit(async data => {
          await create(data);
        })}
      >
        {step === "absence" && (
          <>
            {props.actingAsEmployee ? (
              <Typography variant="h1">{t("Create absence")}</Typography>
            ) : (
              <>
                <Typography variant="h5">{t("Create absence")}</Typography>
                <Typography variant="h1">{name}</Typography>
              </>
            )}
            <Section className={classes.absenceDetails}>
              <AbsenceDetails
                currentMonth={state.viewingCalendarMonth}
                onSwitchMonth={d =>
                  dispatch({ action: "switchMonth", month: d })
                }
                wantsReplacement={state.needsReplacement}
                onSubstituteWantedChange={subWanted =>
                  dispatch({ action: "setNeedsReplacement", to: subWanted })
                }
                organizationId={props.organizationId}
                employeeId={state.employeeId}
                setValue={setValue}
                absenceDates={state.absenceDates}
                onToggleAbsenceDate={d =>
                  dispatch({ action: "toggleDate", date: d })
                }
                values={formValues}
                errors={errors}
                triggerValidation={triggerValidation}
                isAdmin={props.userIsAdmin}
                needsReplacement={props.needsReplacement}
                vacancies={projectedVacancies}
                setStep={setStep}
                locationIds={props.locationIds}
                disabledDates={disabledDates}
                balanceUsageText={absenceUsageText || undefined}
                setVacanciesInput={setVacanciesInput}
                replacementEmployeeId={formValues.replacementEmployeeId}
                replacementEmployeeName={formValues.replacementEmployeeName}
                onRemoveReplacement={removePrearrangedReplacementEmployee}
              />
            </Section>
          </>
        )}
        {step === "preAssignSub" && (
          <AssignSub
            orgId={props.organizationId}
            userIsAdmin={props.userIsAdmin}
            employeeName={name}
            employeeId={state.employeeId}
            positionId={props.positionId}
            positionName={props.positionName}
            vacancies={projectedVacancies}
            disabledDates={disabledDates}
            onCancel={onCancel}
            onSelectReplacement={onAssignSub}
          />
        )}
        {step === "confirmation" && (
          <Confirmation
            orgId={props.organizationId}
            absence={absence}
            setStep={setStep}
            disabledDates={disabledDates}
            isAdmin={props.userIsAdmin}
          />
        )}
      </form>
      {step === "edit" && (
        <EditVacancies
          actingAsEmployee={props.actingAsEmployee}
          employeeName={name}
          positionName={props.positionName}
          onCancel={onCancel}
          details={projectedVacancyDetails}
          onChangedVacancies={onChangedVacancies}
          employeeId={props.employeeId}
          setStep={setStep}
          disabledDates={disabledDates}
        />
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  subtitle: {
    fontSize: theme.typography.pxToRem(24),
  },
  absenceDetails: {
    marginTop: theme.spacing(3),
  },
}));

const initialState = (props: Props): CreateAbsenceState => {
  const needsReplacement =
    props.initialNeedsReplacement === undefined
      ? props.needsReplacement !== NeedsReplacement.No
      : props.initialNeedsReplacement;
  const absenceDates = props.initialDates || [startOfDay(new Date())];
  const viewingCalendarMonth = startOfMonth(min(absenceDates));
  return {
    employeeId: props.employeeId,
    organizationId: props.organizationId,
    viewingCalendarMonth,
    needsReplacement,
    absenceDates,
  };
};

export type CreateAbsenceFormData = {
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

export const buildAbsenceCreateInput = (
  absenceDates: Date[],
  formValues: CreateAbsenceFormData,
  organizationId: number,
  employeeId: number,
  positionId: number,
  disabledDates: DisabledDate[],
  needsReplacement: boolean,
  vacancyDetails?: VacancyDetail[]
): AbsenceCreateInput | null => {
  if (
    isEmpty(absenceDates) ||
    !formValues.absenceReason ||
    !formValues.dayPart
  ) {
    return null;
  }

  const dates = differenceWith(absenceDates, disabledDates, (a, b) =>
    isSameDay(a, b.date)
  );

  if (!dates.length) {
    return null;
  }

  // Must have a start and end time if Hourly
  if (
    formValues.dayPart === DayPart.Hourly &&
    (!formValues.hourlyStartTime ||
      !formValues.hourlyEndTime ||
      isBefore(formValues.hourlyEndTime, formValues.hourlyStartTime))
  ) {
    return null;
  }

  let absence: AbsenceCreateInput = {
    orgId: organizationId,
    employeeId: employeeId,
    notesToApprover: formValues.notesToApprover,
    details: dates.map(d => {
      let detail: AbsenceDetailCreateInput = {
        date: format(d, "P"),
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
  };

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

  // Populate the Vacancies on the Absence
  absence = {
    ...absence,
    /* TODO: When we support multi Position Employees we'll need to account for the following:
          When creating an Absence, there must be 1 Vacancy created here per Position Id.
      */
    vacancies: [
      {
        positionId: positionId,
        useSuppliedDetails: vDetails !== undefined,
        needsReplacement: needsReplacement,
        notesToReplacement: formValues.notesToReplacement,
        prearrangedReplacementEmployeeId: formValues.replacementEmployeeId,
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

import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isBefore,
  isDate,
  isEqual,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { useForm } from "forms";
import {
  HookQueryResult,
  useMutationBundle,
  useQueryBundle,
} from "graphql/hooks";
import {
  Absence,
  AbsenceCreateInput,
  AbsenceDetailCreateInput,
  AbsenceReasonTrackingTypeId,
  AbsenceVacancyInput,
  CalendarDayType,
  DayPart,
  NeedsReplacement,
  Vacancy,
} from "graphql/server-types.gen";
import { convertStringToDate, isAfterDate } from "helpers/date";
import { parseTimeFromString, secondsSinceMidnight } from "helpers/time";
import { useQueryParamIso } from "hooks/query-params";
import { useSnackbar } from "hooks/use-snackbar";
import { compact, differenceWith, flatMap } from "lodash-es";
import * as React from "react";
import { useEffect, useMemo, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { AbsenceDetails } from "./absence-details";
import { AssignSub } from "./assign-sub/index";
import { Confirmation } from "./confirmation";
import { EditVacancies } from "./edit-vacancies";
import { CreateAbsence } from "./graphql/create.gen";
import {
  GetEmployeeContractSchedule,
  GetEmployeeContractScheduleQuery,
  GetEmployeeContractScheduleQueryVariables,
} from "./graphql/get-contract-schedule.gen";
import { GetProjectedAbsenceUsage } from "./graphql/get-projected-absence-usage.gen";
import { GetProjectedVacancies } from "./graphql/get-projected-vacancies.gen";
import { createAbsenceReducer, CreateAbsenceState } from "./state";
import { StepParams } from "./step-params";
import { VacancyDetail } from "./types";

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
};

export const CreateAbsenceUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const [absence, setAbsence] = useState<Absence>();

  const [vacanciesInput, setVacanciesInput] = useState<VacancyDetail[]>();

  const [createAbsence] = useMutationBundle(CreateAbsence, {
    onError: error => {
      openSnackbar({
        message: error.graphQLErrors.map((e, i) => {
          const errorMessage =
            e.extensions?.data?.text ?? e.extensions?.data?.code;
          if (!errorMessage) {
            return null;
          }
          return <div key={i}>{errorMessage}</div>;
        }),
        dismissable: true,
        status: "error",
      });
    },
  });

  const [step, setStep] = useQueryParamIso(StepParams);

  const [state, dispatch] = useReducer(
    createAbsenceReducer,
    props,
    initialState
  );
  const today = new Date();
  const initialFormData: CreateAbsenceFormData = {
    startDate: today,
    endDate: today,
    absenceReason: "",
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState,
    getValues,
    errors,
    triggerValidation,
  } = useForm<CreateAbsenceFormData>({
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

  const contractSchedule = useQueryBundle(GetEmployeeContractSchedule, {
    variables: {
      id: state.employeeId,
      fromDate: format(addMonths(state.viewingCalendarMonth, -1), "yyyy-M-d"),
      toDate: format(
        endOfMonth(addMonths(state.viewingCalendarMonth, 2)),
        "yyyy-M-d"
      ),
    },
  });

  const disabledDates = useMemo(() => computeDisabledDates(contractSchedule), [
    contractSchedule,
  ]);

  const projectedVacanciesInput = useMemo(
    () =>
      buildAbsenceCreateInput(
        formValues,
        Number(state.organizationId),
        Number(state.employeeId),
        Number(props.positionId),
        disabledDates,
        vacanciesInput !== undefined,
        state,
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
    },
    skip: projectedVacanciesInput === null,
    onError: () => {},
  });

  const getProjectedAbsenceUsage = useQueryBundle(GetProjectedAbsenceUsage, {
    variables: {
      absence: projectedVacanciesInput!,
    },
    skip: projectedVacanciesInput === null,
    // fetchPolicy: "no-cache",
    onError: error => {
      // This shouldn't prevent the User from continuing on
      // with Absence Create. Any major issues will be caught
      // and reported back to them when calling the Create mutation.
    },
  });

  const projectedVacancyDetails: VacancyDetail[] = useMemo(() => {
    /* cf 2019-11-25
    we don't currently support having multiple AbsenceVacancyInputs on this page.
    as such, this projection can't handle that case
    */
    if (
      !(
        getProjectedVacancies.state === "DONE" ||
        getProjectedVacancies.state === "UPDATING"
      )
    ) {
      return [];
    }
    const vacancies = getProjectedVacancies.data.absence?.projectedVacancies;
    if (!vacancies || vacancies.length < 1) {
      return [];
    }
    return (vacancies[0]?.details ?? [])
      .map(d => ({
        date: d?.startDate,
        locationId: d?.locationId,
        startTime: d?.startTimeLocal,
        endTime: d?.endTimeLocal,
      }))
      .filter(
        (detail): detail is VacancyDetail =>
          detail.locationId && detail.date && detail.startTime && detail.endTime
      );
  }, [getProjectedVacancies.state]);

  const theVacancyDetails: VacancyDetail[] =
    vacanciesInput || projectedVacancyDetails;

  const projectedVacancies =
    getProjectedVacancies.state === "LOADING" ||
    getProjectedVacancies.state === "UPDATING"
      ? []
      : (compact(
          getProjectedVacancies.data?.absence?.projectedVacancies ?? []
        ) as Vacancy[]);

  const absenceUsageText = useMemo(() => {
    /*
      cf 2019-11-21
      Given that we can't select multiple absence reasons via the UI, I'm
      not attempting to implement this calculation in a way that could handle
      multiple absence reasons or differing units.
    */
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

    if (usages.length < 1) return null;

    const type = usages[0].absenceReasonTrackingTypeId!;
    const amount = usages.reduce((m, v) => m + v.amount, 0);
    const unitText = {
      [AbsenceReasonTrackingTypeId.Invalid]: null,
      [AbsenceReasonTrackingTypeId.Daily]: ["day", "days"],
      [AbsenceReasonTrackingTypeId.Hourly]: ["hour", "hours"],
    }[type];
    if (!unitText) return null;
    return `${t("Uses")} ${amount} ${t(unitText[Number(amount !== 1)])} ${t(
      "of your balance"
    )}`;
  }, [getProjectedVacancies]);

  const name = `${props.firstName} ${props.lastName}`;

  const create = async (formValues: CreateAbsenceFormData) => {
    const absenceCreateInput = buildAbsenceCreateInput(
      formValues,
      Number(state.organizationId),
      Number(state.employeeId),
      Number(props.positionId),
      disabledDates,
      true,
      state,
      theVacancyDetails
    );
    if (!absenceCreateInput) {
      return null;
    }

    const result = await createAbsence({
      variables: {
        absence: absenceCreateInput,
      },
    });

    return result?.data?.absence?.create as Absence;
  };

  const onChangedVacancies = React.useCallback(
    (vacancyDetails: VacancyDetail[]) => {
      console.log("changedVacancies -- update vacancy input", vacancyDetails);
      setStep("absence");
      setVacanciesInput(vacancyDetails);
    },
    [setVacanciesInput, setStep]
  );
  const onCancel = React.useCallback(() => setStep("absence"), [setStep]);

  return (
    <>
      <PageTitle title={t("Create absence")} withoutHeading />

      {/* {JSON.stringify(getValues())} */}

      <form
        onSubmit={handleSubmit(async (data, e) => {
          const absence = await create(data);
          if (absence) {
            setAbsence(absence);
            setStep("confirmation");
          }
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
                state={state}
                dispatch={dispatch}
                setValue={setValue}
                values={formValues}
                errors={errors}
                triggerValidation={triggerValidation}
                isAdmin={props.userIsAdmin}
                needsReplacement={props.needsReplacement}
                vacancies={projectedVacancies}
                setStep={setStep}
                disabledDates={disabledDates}
                balanceUsageText={absenceUsageText || undefined}
                setVacanciesInput={setVacanciesInput}
              />
            </Section>
          </>
        )}
        {step === "preAssignSub" && (
          <AssignSub
            orgId={props.organizationId}
            userIsAdmin={props.userIsAdmin}
            employeeName={name}
            positionId={props.positionId}
            positionName={props.positionName}
            vacancies={projectedVacancies}
            setStep={setStep}
            setValue={setValue}
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

const initialState = (props: Props): CreateAbsenceState => ({
  employeeId: props.employeeId,
  organizationId: props.organizationId,
  viewingCalendarMonth: startOfMonth(new Date()),
  needsReplacement: props.needsReplacement !== NeedsReplacement.No,
});

export type CreateAbsenceFormData = {
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

const computeDisabledDates = (
  queryResult: HookQueryResult<
    GetEmployeeContractScheduleQuery,
    GetEmployeeContractScheduleQueryVariables
  >
) => {
  if (queryResult.state !== "DONE" && queryResult.state !== "UPDATING") {
    return [];
  }
  const dates = new Set<Date>();
  queryResult.data.employee?.employeeContractSchedule?.forEach(contractDate => {
    switch (contractDate?.calendarDayTypeId) {
      case CalendarDayType.CancelledDay:
      case CalendarDayType.Invalid:
      case CalendarDayType.NonWorkDay: {
        const theDate = startOfDay(parseISO(contractDate.date));
        dates.add(theDate);
      }
    }
  });
  queryResult.data.employee?.employeeAbsenceSchedule?.forEach(absence => {
    const startDate = absence?.startDate;
    const endDate = absence?.endDate;
    if (startDate && endDate) {
      eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate),
      }).forEach(day => {
        dates.add(startOfDay(day));
      });
    }
  });
  return [...dates];
};

const buildAbsenceCreateInput = (
  formValues: CreateAbsenceFormData,
  organizationId: number,
  employeeId: number,
  positionId: number,
  disabledDates: Date[],
  includeVacanciesIfNeedsReplacement: boolean,
  state: CreateAbsenceState,
  vacancyDetails?: VacancyDetail[]
) => {
  if (
    !formValues.startDate ||
    !formValues.absenceReason ||
    !formValues.dayPart
  ) {
    return null;
  }

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
    return null;
  }

  // Ensure the end date is after the start date or they are equal
  if (!isEqual(startDate, endDate) && !isAfterDate(endDate, startDate)) {
    return null;
  }

  let dates = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  // Filter out disabled dates
  dates = differenceWith(dates, disabledDates, (a, b) => isEqual(a, b));

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

  // Populate the Vacancies on the Absence if needed
  if (state.needsReplacement && includeVacanciesIfNeedsReplacement) {
    absence = {
      ...absence,
      /* TODO: When we support multi Position Employees we'll need to account for the following:
            When creating an Absence, there must be 1 Vacancy created here per Position Id.
        */
      vacancies: [
        {
          positionId: positionId,
          useSuppliedDetails: true,
          needsReplacement: state.needsReplacement,
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
          payCodeId: formValues.payCode
            ? Number(formValues.payCode)
            : undefined,
        },
      ],
    };
  }

  return absence;
};

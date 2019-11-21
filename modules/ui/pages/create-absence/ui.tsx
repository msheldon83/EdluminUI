import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import {
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  startOfDay,
} from "date-fns";
import { useForm } from "forms";
import {
  useQueryBundle,
  useMutationBundle,
  HookQueryResult,
} from "graphql/hooks";
import {
  DayPart,
  NeedsReplacement,
  Vacancy,
  AbsenceCreateInput,
  AbsenceDetailCreateInput,
  Absence,
  CalendarDayType,
} from "graphql/server-types.gen";
import * as React from "react";
import { useReducer, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { AbsenceDetails } from "./absence-details";
import { createAbsenceReducer, CreateAbsenceState } from "./state";
import { AssignSub } from "./assign-sub/index";
import { GetProjectedVacancies } from "./graphql/get-projected-vacancies.gen";
import { secondsSinceMidnight, parseTimeFromString } from "helpers/time";
import { format, isValid, isDate } from "date-fns";
import { getDaysInDateRange } from "helpers/date";
import { useHistory } from "react-router";
import { CreateAbsence } from "./graphql/create.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { Confirmation } from "./confirmation";
import {
  GetEmployeeContractSchedule,
  GetEmployeeContractScheduleQuery,
  GetEmployeeContractScheduleQueryVariables,
} from "./graphql/get-contract-schedule.gen";

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
  const history = useHistory();
  const { openSnackbar } = useSnackbar();
  const [absence, setAbsence] = useState<Absence>();
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

  const [state, dispatch] = useReducer(
    createAbsenceReducer,
    props,
    initialState
  );
  const today = new Date();
  const initialFormData: FormData = {
    startDate: today,
    endDate: today,
    absenceReason: "",
    needsReplacement: props.needsReplacement !== NeedsReplacement.No,
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState,
    getValues,
    errors,
  } = useForm<FormData>({
    defaultValues: initialFormData,
  });

  const required = t("Required");
  register({ name: "dayPart", type: "custom" }, { required });
  register({ name: "absenceReason", type: "custom" }, { required });
  register({ name: "startDate", type: "custom" }, { required });
  register({ name: "endDate", type: "custom" }, { required });
  register({ name: "needsReplacement", type: "custom" });
  register({ name: "notesToApprover", type: "custom" });
  register({ name: "notesToReplacement", type: "custom" });
  register({ name: "replacementEmployeeId", type: "custom" });
  register({ name: "replacementEmployeeName", type: "custom" });

  const formValues = getValues();

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

  const projectedVacanciesInput = buildAbsenceCreateInput(
    formValues,
    Number(state.organizationId),
    Number(state.employeeId),
    Number(props.positionId),
    false
  );
  const getProjectedVacancies = useQueryBundle(GetProjectedVacancies, {
    variables: {
      absence: projectedVacanciesInput,
    },
    skip: projectedVacanciesInput === null,
    onError: error => {
      // This shouldn't prevent the User from continuing on
      // with Absence Create. Any major issues will be caught
      // and reported back to them when calling the Create mutation.
      console.error("Error trying to get projected vacancies", error);
    },
  });

  const projectedVacancies = (getProjectedVacancies.state === "LOADING" ||
  getProjectedVacancies.state === "UPDATING"
    ? []
    : getProjectedVacancies.data?.absence?.projectedVacancies ??
      []) as Vacancy[];

  const name = `${props.firstName} ${props.lastName}`;

  const params = new URLSearchParams(history.location.search);
  if (!params.has("action") && state.step !== "absence") {
    dispatch({
      action: "switchStep",
      step: "absence",
    });
  }

  const selectReplacementEmployee = async (
    replacementEmployeeId: number,
    name: string
  ) => {
    await setValue("replacementEmployeeId", replacementEmployeeId);
    await setValue("replacementEmployeeName", name);

    history.push({
      ...history.location,
      search: "",
    });
    dispatch({
      action: "switchStep",
      step: "absence",
    });
  };

  const create = async (formValues: FormData) => {
    const absenceCreateInput = buildAbsenceCreateInput(
      formValues,
      Number(state.organizationId),
      Number(state.employeeId),
      Number(props.positionId),
      true
    );
    if (!absence) {
      return null;
    }

    const result = await createAbsence({
      variables: {
        absence: absenceCreateInput!,
      },
    });

    return result?.data?.absence?.create as Absence;
  };

  return (
    <>
      <PageTitle title={t("Create absence")} withoutHeading />

      {/* {JSON.stringify(getValues())} */}

      <form
        onSubmit={handleSubmit(async (data, e) => {
          const absence = await create(data);
          if (absence) {
            setAbsence(absence);
            history.push({
              ...history.location,
              search: "?action=success",
            });
            dispatch({
              action: "switchStep",
              step: "confirmation",
            });
          }
        })}
      >
        {state.step === "absence" && (
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
                values={getValues()}
                isAdmin={props.userIsAdmin}
                needsReplacement={props.needsReplacement}
                vacancies={projectedVacancies}
                disabledDates={disabledDates}
              />
            </Section>
          </>
        )}
        {state.step === "assignSub" && (
          <AssignSub
            orgId={props.organizationId}
            userIsAdmin={props.userIsAdmin}
            employeeName={name}
            positionId={props.positionId}
            positionName={props.positionName}
            vacancies={projectedVacancies}
            selectReplacementEmployee={selectReplacementEmployee}
          />
        )}
        {state.step === "confirmation" && (
          <Confirmation
            orgId={props.organizationId}
            absence={absence}
            dispatch={dispatch}
            disabledDates={disabledDates}
          />
        )}
      </form>
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
  step: "absence",
  viewingCalendarMonth: startOfMonth(new Date()),
});

export type FormData = {
  startDate: Date;
  endDate: Date;
  absenceReason: string;
  dayPart?: DayPart;
  notesToApprover?: string;
  notesToReplacement?: string;
  needsReplacement: boolean;
  replacementEmployeeId?: number;
  replacementEmployeeName?: string;
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
  formValues: FormData,
  organizationId: number,
  employeeId: number,
  positionId: number,
  includeVacanciesIfNeedsReplacement: boolean
) => {
  if (
    !formValues.startDate ||
    !formValues.endDate ||
    !formValues.absenceReason ||
    !formValues.dayPart
  ) {
    return null;
  }

  const startDate =
    typeof formValues.startDate === "string"
      ? new Date(formValues.startDate)
      : formValues.startDate;
  const endDate =
    typeof formValues.endDate === "string"
      ? new Date(formValues.endDate)
      : formValues.endDate;

  if (
    !isDate(startDate) ||
    !isValid(startDate) ||
    !isDate(endDate) ||
    !isValid(endDate)
  ) {
    return null;
  }

  const dates = eachDayOfInterval({
    start: formValues.startDate,
    end: formValues.endDate,
  });

  if (!dates.length) {
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
        //TODO: provide a way to specify start and end time in the UI when Hourly
        detail = {
          ...detail,
          startTime: "",
          endTime: "",
        };
      }

      return detail;
    }),
  };

  // Populate the Vacancies on the Absence if needed
  if (formValues.needsReplacement && includeVacanciesIfNeedsReplacement) {
    absence = {
      ...absence,
      /* TODO: When we support multi Position Employees we'll need to account for the following:
            When creating an Absence, there must be 1 Vacancy created here per Position Id.
        */
      vacancies: [
        {
          positionId: positionId,
          needsReplacement: formValues.needsReplacement,
          notesToReplacement: formValues.notesToReplacement,
          prearrangedReplacementEmployeeId: formValues.replacementEmployeeId,
        },
      ],
    };
  }

  return absence;
};

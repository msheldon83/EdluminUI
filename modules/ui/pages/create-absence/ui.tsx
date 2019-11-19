import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { startOfMonth } from "date-fns";
import { useForm } from "forms";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import {
  DayPart,
  NeedsReplacement,
  Vacancy,
  AbsenceCreateInput,
  AbsenceDetailCreateInput,
} from "graphql/server-types.gen";
import * as React from "react";
import { useReducer } from "react";
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

const buildInputForProjectedVacancies = (
  values: Partial<FormData>,
  orgId: number,
  employeeId: number
): AbsenceCreateInput | null => {
  // TODO: these should come from the Employee's schedule
  const startTime = "08:00 AM";
  const endTime = "12:00 PM";

  if (!values.startDate || !values.endDate) {
    return null;
  }

  const startDate =
    typeof values.startDate === "string"
      ? new Date(values.startDate)
      : values.startDate;
  const endDate =
    typeof values.endDate === "string"
      ? new Date(values.endDate)
      : values.endDate;

  if (
    !isDate(startDate) ||
    !isValid(startDate) ||
    !isDate(endDate) ||
    !isValid(endDate)
  ) {
    return null;
  }

  const allDays = getDaysInDateRange(startDate, endDate);

  if (!allDays.length) {
    return null;
  }

  return {
    orgId,
    employeeId,
    details: allDays.map(d => {
      return {
        date: format(d, "P"),
        startTime: secondsSinceMidnight(parseTimeFromString(startTime)),
        endTime: secondsSinceMidnight(parseTimeFromString(endTime)),
        dayPartId: values.dayPart ?? DayPart.FullDay,
      };
    }),
  };
};

export const CreateAbsenceUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const { openSnackbar } = useSnackbar();
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

  const formValues = getValues();
  const projectedVacanciesInput = buildInputForProjectedVacancies(
    formValues,
    Number(props.organizationId),
    Number(props.employeeId)
  );
  const getProjectedVacancies = useQueryBundle(GetProjectedVacancies, {
    variables: {
      absence: projectedVacanciesInput,
    },
    skip: projectedVacanciesInput === null,
  });

  const projectedVacancies = (getProjectedVacancies.state === "LOADING" ||
  getProjectedVacancies.state === "UPDATING"
    ? []
    : getProjectedVacancies.data?.absence?.projectedVacancies ?? []) as Pick<
    Vacancy,
    "startTimeLocal" | "endTimeLocal" | "numDays" | "positionId" | "details"
  >[];

  const name = `${props.firstName} ${props.lastName}`;

  const params = new URLSearchParams(history.location.search);
  if (!params.has("action") && state.step !== "absence") {
    dispatch({
      action: "switchStep",
      step: "absence",
    });
  }

  const create = async (dates: Date[]) => {
    const formValues = getValues();
    const positionId = props.positionId ? Number(props.positionId) : 0;
    const absence: AbsenceCreateInput = {
      orgId: Number(state.organizationId),
      employeeId: Number(state.employeeId),
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
      vacancies: [
        {
          positionId: positionId,
          needsReplacement: formValues.needsReplacement,
          notesToReplacement: formValues.notesToReplacement,
          //prearrangedReplacementEmployeeId
        },
      ],
    };

    console.log("Absence", absence);

    const result = await createAbsence({
      variables: {
        absence: absence,
      },
    });

    return result?.data?.absence?.create?.id;
  };

  return (
    <>
      <PageTitle title={t("Create absence")} withoutHeading />

      {/* {JSON.stringify(getValues())} */}

      <form onSubmit={handleSubmit((data, e) => console.log(data))}>
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
                create={create}
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
};

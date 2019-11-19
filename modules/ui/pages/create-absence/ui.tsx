import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import {
  eachDayOfInterval,
  format,
  isDate,
  isValid,
  startOfMonth,
} from "date-fns";
import { useForm } from "forms";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import {
  Absence,
  AbsenceCreateInput,
  AbsenceDetailCreateInput,
  DayPart,
  NeedsReplacement,
  Vacancy,
} from "graphql/server-types.gen";
import { getDaysInDateRange } from "helpers/date";
import { parseTimeFromString, secondsSinceMidnight } from "helpers/time";
import { useQueryParamIso } from "hooks/query-params";
import { useSnackbar } from "hooks/use-snackbar";
import * as React from "react";
import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { AbsenceDetails } from "./absence-details";
import { AssignSub } from "./assign-sub/index";
import { Confirmation } from "./confirmation";
import { EditVacancies } from "./edit-vacancies";
import { CreateAbsence } from "./graphql/create.gen";
import { GetProjectedVacancies } from "./graphql/get-projected-vacancies.gen";
import { createAbsenceReducer, CreateAbsenceState } from "./state";
import { StepParams } from "./step-params";

export type VacancyDisplayData = Pick<
  Vacancy,
  "startTimeLocal" | "endTimeLocal" | "numDays" | "positionId" | "details"
>[];

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
  const [absence, setAbsence] = useState<
    Pick<
      Absence,
      "id" | "employeeId" | "numDays" | "notesToApprover" | "details"
    >
  >();
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
  const initialFormData: FormData = {
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
    : getProjectedVacancies.data?.absence?.projectedVacancies ??
      []) as VacancyDisplayData;

  const name = `${props.firstName} ${props.lastName}`;

  // const params = new URLSearchParams(history.location.search);
  // if (!params.has("action") && step !== "absence") {
  //   dispatch({
  //     action: "switchStep",
  //     step: "absence",
  //   });
  // }

  const selectReplacementEmployee = async (
    replacementEmployeeId: number,
    name: string
  ) => {
    await setValue("replacementEmployeeId", replacementEmployeeId);
    await setValue("replacementEmployeeName", name);
    setStep("absence");
  };

  const create = async (formValues: FormData) => {
    const positionId = props.positionId ? Number(props.positionId) : 0;
    const dates = eachDayOfInterval({
      start: formValues.startDate,
      end: formValues.endDate,
    });

    let absence: AbsenceCreateInput = {
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
    };

    // Populate the Vacancies on the Absence if needed
    if (state.needsReplacement) {
      absence = {
        ...absence,
        /* TODO: When we support multi Position Employees we'll need to account for the following:
            When creating an Absence, there must be 1 Vacancy created here per Position Id.
        */
        vacancies: [
          {
            positionId: positionId,
            needsReplacement: state.needsReplacement,
            notesToReplacement: formValues.notesToReplacement,
            prearrangedReplacementEmployeeId: formValues.replacementEmployeeId,
          },
        ],
      };
    }

    const result = await createAbsence({
      variables: {
        absence: absence,
      },
    });

    return result?.data?.absence?.create as Pick<
      Absence,
      "id" | "employeeId" | "numDays" | "notesToApprover" | "details"
    >;
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
                values={getValues()}
                isAdmin={props.userIsAdmin}
                needsReplacement={props.needsReplacement}
                vacancies={projectedVacancies}
                setStep={setStep}
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
            selectReplacementEmployee={selectReplacementEmployee}
          />
        )}
        {step === "confirmation" && (
          <Confirmation
            orgId={props.organizationId}
            absence={absence}
            vacancies={projectedVacancies}
            setStep={setStep}
            needsReplacement={true}
            notesToSubstitute={formValues.notesToReplacement}
            preAssignedReplacementEmployeeName={
              formValues.replacementEmployeeName
            }
          />
        )}
        {step === "edit" && (
          <EditVacancies
            actingAsEmployee={props.actingAsEmployee}
            employeeName={name}
            positionName={props.positionName}
            setStep={setStep}
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
  viewingCalendarMonth: startOfMonth(new Date()),
  needsReplacement: props.needsReplacement !== NeedsReplacement.No,
});

export type FormData = {
  startDate: Date;
  endDate: Date;
  absenceReason: string;
  dayPart?: DayPart;
  notesToApprover?: string;
  notesToReplacement?: string;
  replacementEmployeeId?: number;
  replacementEmployeeName?: string;
};

const buildInputForProjectedVacancies = (
  values: Partial<FormData>,
  orgId: number,
  employeeId: number
): AbsenceCreateInput | null => {
  // TODO: these should come from the Employee's schedule
  const startTime = "08:00 AM";
  const endTime = "12:00 PM";

  if (
    !values.startDate ||
    !values.endDate ||
    !values.absenceReason ||
    !values.dayPart
  ) {
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
        reasons: [{ absenceReasonId: Number(values.absenceReason) }],
      };
    }),
  };
};

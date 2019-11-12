import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useForm } from "forms";
import { useQueryBundle } from "graphql/hooks";
import { DayPart, NeedsReplacement } from "graphql/server-types.gen";
import * as React from "react";
import { useReducer } from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { AbsenceDetails } from "./absence-details";
import { GetEmployee } from "./graphql/get-employee.gen";
import { createAbsenceReducer, CreateAbsenceState } from "./state";
import { useIsAdmin } from "reference-data/is-admin";

type Props = {
  employeeId: string;
  actingAsEmployee?: boolean;
  organizationId: string;
};

export const CreateAbsenceUI: React.FC<Props> = props => {
  const { t } = useTranslation();

  const employeeInfo = useQueryBundle(GetEmployee, {
    variables: {
      employeeId: props.employeeId,
    },
  });
  let name = "";
  let needsReplacement: NeedsReplacement | null = null;
  if (employeeInfo.state === "DONE" || employeeInfo.state === "UPDATING") {
    const emp = employeeInfo.data.employee?.byId;
    name = `${emp?.firstName} ${emp?.lastName}`;
    needsReplacement =
      employeeInfo.data.employee?.byId?.primaryPosition?.needsReplacement ??
      null;
  }
  const userIsAdmin = useIsAdmin();

  const classes = useStyles();
  const {
    register,
    handleSubmit,
    setValue,
    formState,
    getValues,
    errors,
  } = useForm<FormData>({
    defaultValues: initialFormData(),
  });

  const required = t("Required");
  register({ name: "dayPart", type: "custom" }, { required });
  register({ name: "absenceReason", type: "custom" }, { required });
  register({ name: "startDate", type: "custom" }, { required });
  register({ name: "endDate", type: "custom" }, { required });
  register({ name: "notesToApprover", type: "custom" });
  register({ name: "notesToReplacement", type: "custom" });

  const [state, dispatch] = useReducer(
    createAbsenceReducer,
    props,
    initialState
  );

  return (
    <>
      <PageTitle title={t("Create absence")} withoutHeading />
      {props.actingAsEmployee ? (
        <Typography variant="h1">{t("Create absence")}</Typography>
      ) : (
        <>
          <Typography variant="h5">{t("Create absence")}</Typography>
          <Typography variant="h1">{name}</Typography>
        </>
      )}

      {/* {JSON.stringify(getValues())} */}

      <form>
        {state.step === "absence" && (
          <Section className={classes.absenceDetails}>
            <AbsenceDetails
              state={state}
              setValue={setValue}
              values={getValues()}
              isAdmin={userIsAdmin}
              needsReplacement={needsReplacement}
            />
          </Section>
        )}
      </form>
      {/* <Grid container>
          <Grid item md={4}>
            <Typography className={classes.subtitle}>{t("Time")}</Typography>
          </Grid>
          <Grid item md={8}>
            <Typography className={classes.subtitle}>{t("Reason")}</Typography>
          </Grid>
        </Grid> */}
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
  const today = new Date();
  return {
    employeeId: props.employeeId,
    organizationId: props.organizationId,
    step: "absence",
    startDate: today,
    endDate: today,
  };
};

export type FormData = {
  startDate: Date;
  endDate: Date;
  absenceReason: string;
  dayPart?: DayPart;
  notesToApprover?: string;
  notesToReplacement?: string;
};

const initialFormData = (): FormData => {
  const today = new Date();
  return {
    startDate: today,
    endDate: today,
    absenceReason: "",
  };
};

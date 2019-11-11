import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { Grid, Typography, Paper, Tab, Tabs } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Reducer, useReducer } from "react";
import { createAbsenceReducer, CreateAbsenceState } from "./state";
import { usePagedQueryBundle, useQueryBundle } from "graphql/hooks";
import { GetEmployeesForOrg } from "./graphql/get-employees.gen";
import { SelectEmployee } from "./select-employee";
import { AbsenceDetails } from "./absence-details";
import useForm from "react-hook-form";
import { GetEmployee } from "./graphql/get-employee.gen";

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
  if (employeeInfo.state === "DONE" || employeeInfo.state === "UPDATING") {
    const emp = employeeInfo.data.employee?.byId;
    name = `${emp?.firstName} ${emp?.lastName}`;
  }

  const classes = useStyles();

  const { register, handleSubmit } = useForm();

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

      {/* {JSON.stringify(state)} */}

      {state.step === "absence" && (
        <Section className={""}>
          <AbsenceDetails state={state} dispatch={dispatch} />
        </Section>
      )}
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
  tabs: {
    borderRadius: theme.typography.pxToRem(5),
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: theme.typography.pxToRem(1),
    borderColor: theme.customColors.sectionBorder,
    borderStyle: "solid",
    borderBottom: "0",
    boxShadow: "initial",
    "& button": {
      textTransform: "uppercase",
    },
  },
  content: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
}));

const initialState = (props: Props): CreateAbsenceState => {
  const today = new Date();
  return {
    employeeId: props.employeeId,
    step: "absence",
    startDate: today,
    endDate: today,
  };
};

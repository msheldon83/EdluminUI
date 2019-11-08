import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { Grid, Typography, Paper, Tab, Tabs } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Reducer, useReducer } from "react";
import { createAbsenceReducer, CreateAbsenceState } from "./state";
import { usePagedQueryBundle } from "graphql/hooks";
import { GetEmployeesForOrg } from "./graphql/get-employees.gen";
import { SelectEmployee } from "./select-employee";

type Props = { actingAsEmployeeId?: string; organizationId: string };
export const CreateAbsenceUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [state, dispatch] = useReducer(
    createAbsenceReducer,
    props,
    initialState
  );

  return (
    <>
      <PageTitle title={t("Create absence")} withoutHeading />
      {JSON.stringify(state)}
      <Paper square className={classes.tabs}>
        {/* I believe the tabs are going away, but I put them here for now  */}
        <Tabs value={state.step} indicatorColor="primary" textColor="primary">
          {state.preselectedEmployee || (
            <Tab label={t("Employee")} value="employee" />
          )}
          <Tab label={t("Absence")} value="absence" />
          <Tab label={t("Substitute")} value="substitute" />
        </Tabs>
      </Paper>
      <Section className={classes.content}>
        {state.step === "employee" && (
          <SelectEmployee
            state={state}
            dispatch={dispatch}
            organizationId={props.organizationId}
          />
        )}
        {/* <Grid container>
          <Grid item md={4}>
            <Typography className={classes.subtitle}>{t("Time")}</Typography>
          </Grid>
          <Grid item md={8}>
            <Typography className={classes.subtitle}>{t("Reason")}</Typography>
          </Grid>
        </Grid> */}
      </Section>
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
  if (props.actingAsEmployeeId) {
    return {
      employeeId: props.actingAsEmployeeId,
      preselectedEmployee: true,
      step: "absence",
    };
  }
  return { preselectedEmployee: false, step: "employee" };
};

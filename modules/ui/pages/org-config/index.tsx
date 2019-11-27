import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { makeStyles } from "@material-ui/core/styles";
import Grid, { GridSpacing } from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { Link } from "react-router-dom";
import { useRouteParams } from "ui/routes/definition";
import { AdminChromeRoute } from "ui/routes/app-chrome";
import { GeneralSettingsRoute } from "ui/routes/general-settings";
import { BellScheduleVariantsRoute } from "ui/routes/bell-schedule-variants";
import { CalendarEventReasonsRoute } from "ui/routes/calendar-event-reasons";
import { BellScheduleRoute } from "ui/routes/bell-schedule";
import { ReplacementAttributeRoute } from "ui/routes/replacement-attribute";
import { AbsenceReasonRoute } from "ui/routes/absence-reason";
import { PositionTypeRoute } from "ui/routes/position-type";
import { VacancyReasonRoute } from "ui/routes/vacancy-reason";
import { AbsenceVacancyRulesRoute } from "ui/routes/absence-vacancy-rules";
import { SubstituteSettingsRoute } from "ui/routes/substitute-settings";
import { AccountingCodeRoute } from "ui/routes/accounting-code";
import { PayCodeRoute } from "ui/routes/pay-code";
import { ContractsRoute } from "ui/routes/contracts";
import { Typography } from "@material-ui/core";

//Create Routes for Pages
export const OrgConfigPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(AdminChromeRoute);

  const classes = useStyles();

  //General
  const configGeneralRoutes = [
    {
      name: t("General"),
      icon: (
        <img
          className={classes.alignIcon}
          src={require("ui/icons/general.svg")}
        />
      ),
      route: GeneralSettingsRoute,
    },
  ];

  //Schedules
  const configScheduleRoutes = [
    {
      name: t("Bell Schedule Variations"),
      icon: (
        <img
          className={classes.alignIcon}
          src={require("ui/icons/bell-schedule-variants.svg")}
        />
      ),
      route: BellScheduleVariantsRoute,
    },
    {
      name: t("Bell Schedules"),
      icon: (
        <img
          className={classes.alignIcon}
          src={require("ui/icons/bell-schedules.svg")}
        />
      ),
      route: BellScheduleRoute,
    },
    {
      name: t("Calendar Event Reasons"),
      icon: (
        <img
          className={classes.alignIcon}
          src={require("ui/icons/calendar-event-reasons.svg")}
        />
      ),
      route: CalendarEventReasonsRoute,
    },
  ];

  //Absence & Vacancy
  const configAbsenceVacancyRoutes = [
    {
      name: t("Replacement Attributes"),
      icon: (
        <img
          className={classes.alignIcon}
          src={require("ui/icons/replacement-attribute.svg")}
        />
      ),
      route: ReplacementAttributeRoute,
    },
    {
      name: t("Absence Reasons"),
      icon: (
        <img
          className={classes.alignIcon}
          src={require("ui/icons/absence-reasons.svg")}
        />
      ),
      route: AbsenceReasonRoute,
    },
    {
      name: t("Vacancy Reasons"),
      icon: (
        <img
          className={classes.alignIcon}
          src={require("ui/icons/vacancy-reasons.svg")}
        />
      ),
      route: VacancyReasonRoute,
    },
    {
      name: t("Absence & Vacancy Rules"),
      icon: (
        <img
          className={classes.alignIcon}
          src={require("ui/icons/absence-rules.svg")}
        />
      ),
      route: AbsenceVacancyRulesRoute,
    },
    {
      name: t("Substitute Settings"),
      icon: (
        <img
          className={classes.alignIcon}
          src={require("ui/icons/substitute-settings.svg")}
        />
      ),
      route: SubstituteSettingsRoute,
    },
  ];

  //Finance & Administration
  const configFinanceAdminRoutes = [
    {
      name: t("Accounting Codes"),
      icon: (
        <img
          className={classes.alignIcon}
          src={require("ui/icons/accounting-codes.svg")}
        />
      ),
      route: AccountingCodeRoute,
    },
    {
      name: t("Pay Codes"),
      icon: (
        <img
          className={classes.alignIcon}
          src={require("ui/icons/pay-codes.svg")}
        />
      ),
      route: PayCodeRoute,
    },
    {
      name: t("Position Types"),
      icon: (
        <img
          className={classes.alignIcon}
          src={require("ui/icons/position-types.svg")}
        />
      ),
      route: PositionTypeRoute,
    },
    {
      name: t("Contracts"),
      icon: (
        <img
          className={classes.alignIcon}
          src={require("ui/icons/contracts.svg")}
        />
      ),
      route: ContractsRoute,
    },
  ];

  return (
    <>
      <PageTitle title={t("Configuration")} />
      <Typography className={classes.header} variant="h4">
        General
      </Typography>
      <Grid container className={(classes.root, classes.padding)} spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {configGeneralRoutes.map((r, i) => {
              return (
                <Link
                  key={i}
                  to={r.route.generate(params)}
                  className={classes.textDecoration}
                >
                  <Grid className={classes.paddingRight}>
                    <Paper className={classes.paper}>
                      {r.icon}
                      <div className={classes.paperTextBlock}>{r.name}</div>
                    </Paper>
                  </Grid>
                </Link>
              );
            })}
          </Grid>
        </Grid>
      </Grid>

      <Typography className={classes.header} variant="h4">
        Schedule
      </Typography>
      <Grid container className={(classes.root, classes.padding)} spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {configScheduleRoutes.map((r, i) => {
              return (
                <Link
                  key={i}
                  to={r.route.generate(params)}
                  className={classes.textDecoration}
                >
                  <Grid className={classes.paddingRight}>
                    <Paper className={classes.paper}>
                      {r.icon}
                      <div className={classes.paperTextBlock}>{r.name}</div>
                    </Paper>
                  </Grid>
                </Link>
              );
            })}
          </Grid>
        </Grid>
      </Grid>

      <Typography className={classes.header} variant="h4">
        Absence & Vacancy
      </Typography>
      <Grid container className={(classes.root, classes.padding)} spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {configAbsenceVacancyRoutes.map((r, i) => {
              return (
                <Link
                  key={i}
                  to={r.route.generate(params)}
                  className={classes.textDecoration}
                >
                  <Grid className={classes.paddingRight}>
                    <Paper className={classes.paper}>
                      {r.icon}
                      <div className={classes.paperTextBlock}>{r.name}</div>
                    </Paper>
                  </Grid>
                </Link>
              );
            })}
          </Grid>
        </Grid>
      </Grid>

      <Typography className={classes.header} variant="h4">
        Finance & Administration
      </Typography>
      <Grid container className={(classes.root, classes.padding)} spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {configFinanceAdminRoutes.map((r, i) => {
              return (
                <Link
                  key={i}
                  to={r.route.generate(params)}
                  className={classes.textDecoration}
                >
                  <Grid className={classes.paddingRight}>
                    <Paper className={classes.paper}>
                      {r.icon}
                      <div className={classes.paperTextBlock}>{r.name}</div>
                    </Paper>
                  </Grid>
                </Link>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  textDecoration: {
    textDecorationLine: "none",
  },
  padding: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(6),
    paddingLeft: theme.spacing(2),
  },
  paddingRight: {
    paddingRight: theme.spacing(3),
  },
  paper: {
    height: 140,
    width: 140,
    fontSize: theme.typography.pxToRem(14),
    fontWeight: 500,
    position: "relative",
    "&:hover": {
      backgroundColor: "#d8d8d8",
    },
  },
  paperTextBlock: {
    position: "absolute",
    textAlign: "center",
    width: "100%",
    bottom: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(2),
    fontSize: theme.typography.pxToRem(24),
    fontWeight: 400,
  },
  alignIcon: {
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    paddingTop: theme.spacing(4),
  },
}));

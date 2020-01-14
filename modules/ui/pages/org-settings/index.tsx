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
import { CalendarChangeReasonRoute } from "ui/routes/calendar/event-reasons";
import { BellScheduleRoute } from "ui/routes/bell-schedule";
import { ReplacementAttributeRoute } from "ui/routes/replacement-attribute";
import { AbsenceReasonRoute } from "ui/routes/absence-reason";
import { PositionTypeRoute } from "ui/routes/position-type";
import { VacancyReasonRoute } from "ui/routes/vacancy-reason";
import { AbsenceVacancyRulesRoute } from "ui/routes/absence-vacancy/rules";
import { SubstituteSettingsRoute } from "ui/routes/substitute-settings";
import { AccountingCodeRoute } from "ui/routes/accounting-code";
import { PayCodeRoute } from "ui/routes/pay-code";
import { ContractsRoute } from "ui/routes/contracts";
import { Typography } from "@material-ui/core";
import { Contacts, Tune, Loop } from "@material-ui/icons";
import { Can } from "ui/components/auth/can";
import { PermissionEnum } from "graphql/server-types.gen";

//Create Routes for Pages
export const OrgSettingsPage: React.FC<{}> = props => {
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
      route: CalendarChangeReasonRoute,
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
        <Tune className={[classes.alignIcon, classes.alignMUIIcon].join(" ")} />
      ),
      route: AbsenceVacancyRulesRoute,
    },
    {
      name: t("Substitute Settings"),
      icon: (
        <Loop className={[classes.alignIcon, classes.alignMUIIcon].join(" ")} />
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
        <Contacts
          className={[classes.alignIcon, classes.alignMUIIcon].join(" ")}
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
      <PageTitle title={t("Settings")} />
      <Can
        do={[PermissionEnum.GeneralSettingsView]}
        orgId={params.organizationId}
      >
        <Typography className={classes.header} variant="h4">
          {t("General")}
        </Typography>
        <Grid
          container
          className={(classes.root, classes.padding)}
          spacing={3}
          item
          xs={12}
        >
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
                    <div className={classes.paperTextBlock}>{t(r.name)}</div>
                  </Paper>
                </Grid>
              </Link>
            );
          })}
        </Grid>
      </Can>
      <Can
        do={[PermissionEnum.ScheduleSettingsView]}
        orgId={params.organizationId}
      >
        <Typography className={classes.header} variant="h4">
          {t("Schedule")}
        </Typography>
        <Grid
          container
          className={(classes.root, classes.padding)}
          spacing={3}
          item
          xs={12}
        >
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
                    <div className={classes.paperTextBlock}>{t(r.name)}</div>
                  </Paper>
                </Grid>
              </Link>
            );
          })}
        </Grid>
      </Can>
      <Can do={[PermissionEnum.AbsVacView]} orgId={params.organizationId}>
        <Typography className={classes.header} variant="h4">
          {t("Absence & Vacancy")}
        </Typography>
        <Grid
          container
          className={(classes.root, classes.padding)}
          spacing={3}
          item
          xs={12}
        >
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
                    <div className={classes.paperTextBlock}>{t(r.name)}</div>
                  </Paper>
                </Grid>
              </Link>
            );
          })}
        </Grid>
      </Can>
      <Can
        do={[PermissionEnum.FinanceSettingsView]}
        orgId={params.organizationId}
      >
        <Typography className={classes.header} variant="h4">
          {t("Finance & Administration")}
        </Typography>
        <Grid
          container
          className={(classes.root, classes.padding)}
          spacing={3}
          item
          xs={12}
        >
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
                    <div className={classes.paperTextBlock}>{t(r.name)}</div>
                  </Paper>
                </Grid>
              </Link>
            );
          })}
        </Grid>
      </Can>
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
    marginLeft: theme.spacing(6),
    marginRight: theme.spacing(6),
    marginTop: theme.spacing(4),
  },
  alignMUIIcon: {
    marginLeft: theme.spacing(5),
    fontSize: theme.typography.pxToRem(53),
  },
}));

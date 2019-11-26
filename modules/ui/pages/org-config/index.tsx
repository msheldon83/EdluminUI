import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import SettingsIcon from "@material-ui/icons/Settings";
import NotificationsIcon from "@material-ui/icons/Notifications";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import { Link } from "react-router-dom";
import { useRouteParams } from "ui/routes/definition";
import { AdminChromeRoute } from "ui/routes/app-chrome";
import { BellScheduleRoute } from "ui/routes/bell-schedule";
import { PositionTypeRoute } from "ui/routes/position-type";
import { Typography } from "@material-ui/core";

//Material UI Icons
//Grid Component for layout
//Create Pages for Links
//Create Routes for Pages
//Reference for non-Material UI Icons: <img src={require("ui/icons/visibility_time.svg")} />

export const OrgConfigPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(AdminChromeRoute);

  const configGeneralRoutes = [
    {
      name: t("General"),
      route: BellScheduleRoute, // Route Needed
    },
  ];

  const configScheduleRoutes = [
    {
      name: t("Bell Schedule Variations"),
      route: BellScheduleRoute, // Route Needed
    },
    {
      name: t("Bell Schedules"),
      route: BellScheduleRoute,
    },
    {
      name: t("Calendar Event Reasons"),
      route: BellScheduleRoute, // Route Needed
    },
  ];

  const configAbsenceVacancyRoutes = [
    {
      name: t("Replacement Attributes"),
      route: BellScheduleRoute, // Route Needed
    },
    {
      name: t("Absence Reasons"),
      route: PositionTypeRoute, // Route Needed
    },
    {
      name: t("Vacancy Reasons"),
      route: PositionTypeRoute, // Route Needed
    },
    {
      name: t("Absence & Vacancy Rules"),
      route: PositionTypeRoute, // Route Needed
    },
    {
      name: t("Substitute Settings"),
      route: PositionTypeRoute, // Route Needed
    },
  ];

  const configFinanceAdminRoutes = [
    {
      name: t("Accounting Codes"),
      route: BellScheduleRoute, // Route Needed
    },
    {
      name: t("Pay Codes"),
      route: PositionTypeRoute, // Route Needed
    },
    {
      name: t("Position Types"),
      route: PositionTypeRoute,
    },
    {
      name: t("Contracts"),
      route: PositionTypeRoute, // Route Needed
    },
  ];

  return (
    <>
      <PageTitle title={t("Settings")} />
      <div>
        {configGeneralRoutes.map((r, i) => {
          return (
            <div key={i}>
              <Link to={r.route.generate(params)}>
                <Typography variant="h5">{r.name}</Typography>
              </Link>
            </div>
          );
        })}
      </div>
      <div>
        {configScheduleRoutes.map((r, i) => {
          return (
            <div key={i}>
              <Link to={r.route.generate(params)}>
                <Typography variant="h5">{r.name}</Typography>
              </Link>
            </div>
          );
        })}
      </div>
      <div>
        {configAbsenceVacancyRoutes.map((r, i) => {
          return (
            <div key={i}>
              <Link to={r.route.generate(params)}>
                <Typography variant="h5">{r.name}</Typography>
              </Link>
            </div>
          );
        })}
      </div>
      <div>
        {configFinanceAdminRoutes.map((r, i) => {
          return (
            <div key={i}>
              <Link to={r.route.generate(params)}>
                <Typography variant="h5">{r.name}</Typography>
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
};

import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Link } from "react-router-dom";
import { useRouteParams } from "ui/routes/definition";
import { AdminChromeRoute } from "ui/routes/app-chrome";
import { BellScheduleRoute } from "ui/routes/bell-schedule";
import { PositionTypeRoute } from "ui/routes/position-type";
import { Typography } from "@material-ui/core";

export const OrgConfigPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(AdminChromeRoute);

  const configRoutes = [
    {
      name: t("Bell Schedules"),
      route: BellScheduleRoute,
    },
    {
      name: t("Position Types"),
      route: PositionTypeRoute,
    },
  ];

  return (
    <>
      <PageTitle title={t("Configuration")} />
      <div>
        {configRoutes.map((r, i) => {
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

import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { AdminHomeRoute } from "ui/routes/admin-home";
import { useRouteParams } from "ui/routes/definition";
import { DailyReport } from "ui/components/reports/daily-report/daily-report";

type Props = {};

export const AdminHome: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(AdminHomeRoute);

  return (
    <>
      <PageTitle title={`${params.organizationId} ${t("Home")}`} />
      <DailyReport orgId={params.organizationId} />
    </>
  );
};

const useStyles = makeStyles(theme => ({}));

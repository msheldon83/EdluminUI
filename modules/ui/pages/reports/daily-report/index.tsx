import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { DailyReportRoute } from "ui/routes/daily-report";
import { useRouteParams } from "ui/routes/definition";
import { DailyReport } from "ui/components/reports/daily-report/daily-report";

type Props = {};

export const DailyReportPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(DailyReportRoute);

  return (
    <DailyReport
      orgId={params.organizationId}
      header={t("Filter absences")}
      showFilters={true}
      cards={["unfilled", "filled", "noSubRequired", "total"]}
    />
  );
};

const useStyles = makeStyles(theme => ({}));

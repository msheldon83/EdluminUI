import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { DailyReportRoute } from "ui/routes/absence-vacancy/daily-report";
import { useRouteParams } from "ui/routes/definition";
import { DailyReport } from "ui/components/reports/daily-report/daily-report";
import { FilterQueryParams } from "ui/components/reports/daily-report/filters/filter-params";
import { Grid, Button } from "@material-ui/core";
import { DateStepperHeader } from "ui/components/date-stepper-header";
import { AdminSelectEmployeeForCreateAbsenceRoute } from "ui/routes/create-absence";
import { Link } from "react-router-dom";
import { startOfToday } from "date-fns";
import { useQueryParamIso } from "hooks/query-params";
import { Can } from "ui/components/auth/can";
import { PermissionEnum } from "graphql/server-types.gen";

type Props = {};

export const DailyReportPage: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const params = useRouteParams(DailyReportRoute);
  const [filters] = useQueryParamIso(FilterQueryParams);
  const [date, setDate] = React.useState(new Date(filters.date));
  const createAbsenceRouteParams = useRouteParams(
    AdminSelectEmployeeForCreateAbsenceRoute
  );

  return (
    <>
      <Grid
        container
        justify="space-between"
        alignItems="center"
        className={classes.header}
      >
        <Grid item>
          <DateStepperHeader date={date} setDate={setDate}></DateStepperHeader>
        </Grid>
        <Grid item className={classes.action}>
          <Can do={[PermissionEnum.AbsVacSave]}>
            <Button
              variant="contained"
              component={Link}
              to={AdminSelectEmployeeForCreateAbsenceRoute.generate(
                createAbsenceRouteParams
              )}
            >
              {t("Create Absence")}
            </Button>
          </Can>
        </Grid>
      </Grid>

      <DailyReport
        orgId={params.organizationId}
        date={date}
        setDate={setDate}
        header={t("Filter absences")}
        showFilters={true}
        cards={["unfilled", "filled", "noSubRequired", "total"]}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(3),
    "@media print": {
      marginBottom: theme.spacing(),
    },
  },
  action: {
    "@media print": {
      display: "none",
    },
  },
}));

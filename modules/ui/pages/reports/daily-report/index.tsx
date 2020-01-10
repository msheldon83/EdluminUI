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
import { useIsMobile } from "hooks";
import clsx from "clsx";

type Props = {};

export const DailyReportPage: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const params = useRouteParams(DailyReportRoute);
  const [filters] = useQueryParamIso(FilterQueryParams);
  const [date, setDate] = React.useState(new Date(filters.date));
  const isMobile = useIsMobile();

  return (
    <>
      <Grid
        container
        justify="space-between"
        alignItems="center"
        className={clsx(classes.header, isMobile && classes.mobileHeader)}
      >
        <Grid item>
          <DateStepperHeader date={date} setDate={setDate}></DateStepperHeader>
        </Grid>
        {!isMobile && (
          <Grid item className={classes.action}>
            <Button
              variant="contained"
              component={Link}
              to={AdminSelectEmployeeForCreateAbsenceRoute.generate(params)}
            >
              {t("Create Absence")}
            </Button>
          </Grid>
        )}
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
  mobileHeader: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  action: {
    "@media print": {
      display: "none",
    },
  },
}));

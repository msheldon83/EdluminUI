import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { DailyReportRoute } from "ui/routes/daily-report";
import { useRouteParams } from "ui/routes/definition";
import { DailyReport } from "ui/components/reports/daily-report/daily-report";
import { Grid, Button } from "@material-ui/core";
import { DateStepperHeader } from "ui/components/date-stepper-header";
import { AdminSelectEmployeeForCreateAbsenceRoute } from "ui/routes/create-absence";
import { Link } from "react-router-dom";
import { startOfToday } from "date-fns";

type Props = {};

export const DailyReportPage: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const params = useRouteParams(DailyReportRoute);
  const [date, setDate] = React.useState(startOfToday());
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
        <Grid item>
          <Button
            variant="contained"
            component={Link}
            to={AdminSelectEmployeeForCreateAbsenceRoute.generate(
              createAbsenceRouteParams
            )}
          >
            {t("Create Absence")}
          </Button>
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
  },
}));

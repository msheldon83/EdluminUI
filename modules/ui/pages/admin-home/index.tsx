import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { AdminHomeRoute } from "ui/routes/admin-home";
import { useRouteParams } from "ui/routes/definition";
import { DailyReport } from "ui/components/reports/daily-report/daily-report";
import { startOfToday } from "date-fns";
import { Grid } from "@material-ui/core";
import { DateStepperHeader } from "ui/components/date-stepper-header";

type Props = {};

export const AdminHome: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const params = useRouteParams(AdminHomeRoute);
  const [date, setDate] = React.useState(startOfToday());

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
        <Grid item>{/* Action buttons go here */}</Grid>
      </Grid>

      <DailyReport
        orgId={params.organizationId}
        date={date}
        setDate={setDate}
        header={t("Good morning")}
        showFilters={false}
        cards={["unfilled", "total"]}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(3),
  },
}));

import * as React from "react";
import { Grid, Button, Typography, makeStyles } from "@material-ui/core";
import { VacancyDetail } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { parseISO, format } from "date-fns";

type Props = {
  vacancyDetail: Pick<
    VacancyDetail,
    | "id"
    | "startTimeLocal"
    | "endTimeLocal"
    | "assignment"
    | "payCode"
    | "location"
    | "vacancy"
    | "dayPortion"
  >;
  shadeRow: boolean;
  onVerify: (vacancyDetailId: string) => Promise<void>;
};

export const Assignment: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const vacancyDetail = props.vacancyDetail;

  const vacancyDetailStartTime = parseISO(vacancyDetail.startTimeLocal);
  const vacancyDetailEndTime = parseISO(vacancyDetail.endTimeLocal);
  const assignmentStartTime = parseISO(vacancyDetail.assignment!.startTimeLocal);
  const assignmentEndTime = parseISO(vacancyDetail.assignment!.endTimeLocal);

  const parseDayPortion = (dayPortion: number) => {
    if (dayPortion < 0.5) {
      return t("Partial Day(Hourly)");
    } else if (dayPortion === 0.5) {
      return t("Half Day");
    } else if (dayPortion > 0.5 && dayPortion < 2) {
      return t("Full Day");
    } else {
      return t("Full Days");
    }
  };

  return (
    <>
      <Grid
        container
        justify="space-between"
        alignItems="center"
        spacing={2}
        className={props.shadeRow ? classes.shadedRow : undefined}
      >
        <Grid item xs={2}>
          <Typography className={classes.lightText}>
            {`${t("Absence")} #${vacancyDetail.vacancy!.absence!.id}`}
          </Typography>
          <Typography variant="h6">{`${t("Assignment")} #C${
            vacancyDetail.assignment!.id
          }`}</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography className={classes.lightText}>
            {`${vacancyDetail.vacancy!.absence!.employee!.firstName} ${vacancyDetail.vacancy!.absence!.employee!.lastName}`}
          </Typography>
          <Typography variant="h6">{`${vacancyDetail.assignment!.employee!.firstName} ${vacancyDetail.assignment!.employee!.lastName}`}</Typography>
        </Grid>
        <Grid item xs={2}>          
          <Typography className={classes.lightText}>
            {`${parseDayPortion(vacancyDetail.dayPortion)} (${format(vacancyDetailStartTime, "h:mmaaa")}-${format(vacancyDetailEndTime, "h:mmaaa")})`}
          </Typography>
          <Typography variant="h6">{`${format(assignmentStartTime, "h:mm aaa")} - ${format(assignmentEndTime, "h:mm aaa")}`}</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography className={classes.lightText}>
            {vacancyDetail.vacancy!.position!.name}
          </Typography>
          <Typography variant="h6">{`Pay: ${vacancyDetail.payCode!.name}`}</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography className={classes.lightText}>
            {vacancyDetail.location!.name}
          </Typography>
          <Typography variant="h6">{`Acct: SomeCode`}</Typography>
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="outlined"
            onClick={() => props.onVerify(vacancyDetail.id)}
          >
            {t("Verify")}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export const useStyles = makeStyles(theme => ({
  root: {
    width: 500,
  },
  typography: {
    padding: theme.spacing(2),
  },
  paper: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },

  lightText: {
    fontSize: theme.typography.fontSize,
  },
  locationText: {
    fontSize: theme.typography.fontSize + 4,
  },
  boldText: {
    fontSize: theme.typography.fontSize,
    fontWeight: "bold",
  },
  shadedRow: {
    background: theme.customColors.lightGray,
  },
}));

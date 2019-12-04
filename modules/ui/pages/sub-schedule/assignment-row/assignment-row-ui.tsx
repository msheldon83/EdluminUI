import * as React from "react";
import { DayPart } from "graphql/server-types.gen";
import { makeStyles } from "@material-ui/styles";
import { Grid, Button, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import * as DateFns from "date-fns";

type Props = {
  startDate: string;
  endDate: string;
  locationName: string;
  positionName: string;
  employeeName: string;
  totalDayPart: string;
  startTime: string;
  endTime: string;
  confirmationNumber: string;
  onCancel: () => void;
  className?: string;
};

export const AssignmentRowUI: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const startDate = DateFns.parseISO(props.startDate);
  const endDate = DateFns.parseISO(props.endDate);
  let vacancyDates = DateFns.format(startDate, "MMM d");
  let vacancyDaysOfWeek = DateFns.format(startDate, "EEEE");

  if (!DateFns.isEqual(startDate, endDate)) {
    vacancyDaysOfWeek = `${DateFns.format(startDate, "EEE")} - ${DateFns.format(
      endDate,
      "EEE"
    )}`;
    if (startDate.getMonth() === endDate.getMonth()) {
      vacancyDates = `${vacancyDates} - ${DateFns.format(endDate, "d")}`;
    } else {
      vacancyDates = `${vacancyDates} - ${DateFns.format(endDate, "MMM d")}`;
    }
  }

  return (
    <Grid
      container
      className={props.className}
      justify="space-between"
      alignContent="center"
    >
      <Grid item>
        <Typography className={classes.date}>{vacancyDates}</Typography>
        <Typography className={classes.subText}>{vacancyDaysOfWeek}</Typography>
      </Grid>
      <Grid item>{props.locationName}</Grid>
      <Grid item>
        <Typography className={classes.bold}>{props.positionName}</Typography>
        <Typography className={classes.subText}>
          {t("for")} {props.employeeName}
        </Typography>
      </Grid>
      <Grid item>
        <Typography className={classes.bold}>{props.totalDayPart}</Typography>
      </Grid>
      <Grid item>
        <Typography className={classes.bold}>
          #C{props.confirmationNumber}
        </Typography>
      </Grid>
      <Grid item>
        <Button variant="outlined" onClick={props.onCancel}>
          {t("Cancel")}
        </Button>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  date: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: 500,
  },
  subText: {
    color: theme.customColors.edluminSubText,
  },
  bold: {
    fontWeight: 500,
  },
}));

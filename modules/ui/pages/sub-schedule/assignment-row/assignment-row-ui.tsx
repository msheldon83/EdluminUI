import { Button, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import * as DateFns from "date-fns";
import { formatIsoDateIfPossible } from "helpers/date";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { DayIcon } from "ui/components/day-icon";
import { parseDayPortion } from "ui/components/helpers";

type Props = {
  startDate: string;
  endDate: string;
  startTime: string;
  locationName: string;
  organizationName?: string;
  positionName: string;
  employeeName: string;
  dayPortion: number;
  confirmationNumber: string;
  onCancel: () => void;
  className?: string;
} /* If there are various times within the vacancy, we
     do not want to give false information. However, we still need
     a startTime to determine which day icon to use.
   */ & (
  | {
      multipleTimes: true;
    }
  | {
      multipleTimes: false;
      endTime: string;
    }
);

export const AssignmentRowUI: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const startDate = DateFns.parseISO(props.startDate);
  const endDate = DateFns.parseISO(props.endDate);
  let vacancyDates = DateFns.format(startDate, "MMM d");
  let vacancyDaysOfWeek = DateFns.format(startDate, "EEEE");

  if (!DateFns.isEqual(startDate, endDate)) {
    vacancyDaysOfWeek = `${DateFns.format(startDate, "EEE")}-${DateFns.format(
      endDate,
      "EEE"
    )}`;
    if (startDate.getMonth() === endDate.getMonth()) {
      vacancyDates = `${vacancyDates}-${DateFns.format(endDate, "d")}`;
    } else {
      vacancyDates = `${vacancyDates}-${DateFns.format(endDate, "MMM d")}`;
    }
  }

  return (
    <div className={[classes.container, props.className].join(" ")}>
      <div className={classes.dateContainer}>
        <Typography className={classes.date}>{vacancyDates}</Typography>
        <Typography className={classes.subText}>{vacancyDaysOfWeek}</Typography>
      </div>
      <div className={classes.location}>
        <Typography className={classes.text}>{props.locationName}</Typography>
        {props.organizationName && (
          <Typography className={classes.subText}>
            {props.organizationName}
          </Typography>
        )}
      </div>
      <div className={classes.position}>
        <Typography className={classes.bold}>{props.positionName}</Typography>
        <Typography className={classes.subText}>
          {t("for")} {props.employeeName}
        </Typography>
      </div>

      <div className={classes.dayPartContainer}>
        <DayIcon dayPortion={props.dayPortion} startTime={props.startTime} />

        <div className={classes.dayPart}>
          <Typography variant="h6">{`${Math.round(
            props.dayPortion
          )} ${parseDayPortion(t, props.dayPortion)}`}</Typography>

          <Typography className={classes.subText}>
            {props.multipleTimes
              ? t("Various")
              : `${formatIsoDateIfPossible(
                  props.startTime,
                  "h:mm aaa"
                )} - ${formatIsoDateIfPossible(props.endTime, "h:mm aaa")}`}
          </Typography>
        </div>
      </div>

      <div className={classes.confNumber}>
        <Typography className={classes.bold}>
          #C{props.confirmationNumber}
        </Typography>
      </div>

      <Button
        variant="outlined"
        className={classes.cancel}
        onClick={e => {
          e.stopPropagation();
          props.onCancel();
        }}
      >
        {t("Cancel")}
      </Button>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateContainer: {
    flex: 4,
  },
  date: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: 500,
  },
  location: { flex: 11 },
  position: { flex: 7 },
  subText: {
    color: theme.customColors.edluminSubText,
  },
  bold: {
    fontWeight: 500,
  },
  text: {
    fontSize: theme.typography.pxToRem(18),
  },
  dayPartContainer: {
    display: "flex",
    flex: 8,
  },
  dayPart: {
    display: "inline-block",
    paddingLeft: theme.spacing(1),
  },
  confNumber: { flex: 4 },
  cancel: { color: theme.customColors.darkRed },
}));

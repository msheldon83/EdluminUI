import { makeStyles, Typography } from "@material-ui/core";
import { formatIsoDateIfPossible } from "helpers/date";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { DayIcon } from "ui/components/day-icon";
import { parseDayPortion } from "ui/components/helpers";
import { parseISO, isEqual, format } from "date-fns";
import { useMemo } from "react";

type Props = {
  startDate: string;
  endDate: string;
  startTime: string;
  locationNames: string[];
  organizationName?: string;
  positionName: string;
  employeeName: string;
  dayPortion: number;
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

export const AssignmentDetailsUI: React.FC<Props> = props => {
  const isMobile = useIsMobile();
  const classes = useStyles();
  const { t } = useTranslation();

  const startDate = parseISO(props.startDate);
  const endDate = parseISO(props.endDate);
  let vacancyDates = format(startDate, "MMM d");
  let vacancyDaysOfWeek = format(startDate, "EEEE");
  if (!isEqual(startDate, endDate)) {
    vacancyDaysOfWeek = `${format(startDate, "EEE")} - ${format(
      endDate,
      "EEE"
    )}`;
    if (startDate.getMonth() === endDate.getMonth()) {
      vacancyDates = `${vacancyDates} - ${format(endDate, "d")}`;
    } else {
      vacancyDates = `${vacancyDates} - ${format(endDate, "MMM d")}`;
    }
  }

  const locationNames = useMemo(
    () => [...new Set(props.locationNames)],
    props.locationNames
  );
  const locationNameText =
    locationNames.length > 1
      ? `${locationNames[0]} +${locationNames.length - 1}`
      : locationNames[0];
  return (
    <>
      <div className={classes.date}>
        {isMobile ? (
          <Typography variant="h6">{`${vacancyDates}, ${vacancyDaysOfWeek}`}</Typography>
        ) : (
          <>
            <Typography variant="h6">{vacancyDates}</Typography>
            <Typography className={classes.lightText}>
              {vacancyDaysOfWeek}
            </Typography>
          </>
        )}
      </div>

      <div className={classes.location}>
        <Typography className={classes.text}>
          {locationNameText ?? t("Unknown")}
        </Typography>
        {props.organizationName && (
          <Typography className={classes.subText}>
            {props.organizationName}
          </Typography>
        )}
      </div>

      <div className={classes.position}>
        <Typography className={classes.text}>{props.positionName}</Typography>
        <Typography className={classes.lightText}>
          {t("for")} {props.employeeName}
        </Typography>
      </div>

      <div className={classes.dayPartContainer}>
        <DayIcon dayPortion={props.dayPortion} startTime={props.startTime} />
        <div className={classes.dayPart}>
          <Typography className={classes.text}>{`${Math.round(
            props.dayPortion
          )} ${parseDayPortion(t, props.dayPortion)}`}</Typography>

          <Typography className={classes.subText} noWrap>
            {props.multipleTimes
              ? t("Various")
              : `${formatIsoDateIfPossible(
                  props.startTime,
                  "h:mm aaa"
                )} - ${formatIsoDateIfPossible(props.endTime, "h:mm aaa")}`}
          </Typography>
        </div>
      </div>
    </>
  );
};

export const useStyles = makeStyles(theme => ({
  text: {
    fontSize: theme.typography.pxToRem(14),
  },
  lightText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.customColors.edluminSubText,
  },
  date: {
    flex: 4,
    padding: `0 ${theme.typography.pxToRem(4)}`,
  },
  location: { flex: 11, padding: `0 ${theme.typography.pxToRem(4)}` },
  position: { flex: 7, padding: `0 ${theme.typography.pxToRem(4)}` },
  subText: {
    color: theme.customColors.edluminSubText,
  },
  dayPartContainer: {
    display: "flex",
    flex: 8,
    padding: `0 ${theme.typography.pxToRem(4)}`,
  },
  dayPart: {
    paddingLeft: theme.spacing(),
  },
}));

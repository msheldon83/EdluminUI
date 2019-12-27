import * as React from "react";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import Button from "@material-ui/core/Button";
import addDays from "date-fns/addDays";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import format from "date-fns/format";
import isWeekend from "date-fns/isWeekend";
import startOfWeek from "date-fns/startOfWeek";
import isSameDay from "date-fns/isSameDay";
import { useCallback } from "react";

type FiveWeekCalendarProps = {
  disableWeekends?: boolean;
  disabledDates?: Array<Date>;
  selectedDates?: Array<Date>;
  startDate?: Date;
  contained?: boolean;
  style?: React.CSSProperties;
  onDateClicked?: (d: Date) => void;
};

export const FiveWeekCalendar = (props: FiveWeekCalendarProps) => {
  const {
    selectedDates = [],
    disabledDates = [],
    disableWeekends = false,
    startDate = new Date(),
    contained = true,
    style = {},
    onDateClicked,
  } = props;

  const classes = useStyles({ contained });

  const startingSunday = startOfWeek(startDate);
  const endDate = addDays(startingSunday, 34);
  const daysList = eachDayOfInterval({ start: startingSunday, end: endDate });
  const firstDay = format(startingSunday, "LLL d");
  const lastDay = format(daysList[daysList.length - 1], "LLL d");

  const renderDates = () =>
    daysList.map(date => {
      const day = format(date, "d");
      const formattedDate = format(date, "yyyy-MM-dd");

      const isDisabled =
        (disableWeekends && isWeekend(date)) ||
        disabledDates.find(disabledDate => isSameDay(disabledDate, date));
      const isSelected = selectedDates.find(selectedDate =>
        isSameDay(selectedDate, date)
      );

      const classNames = clsx({
        [classes.dayButton]: true,
        [classes.daySelected]: isSelected,
        [classes.dayDisabled]: isDisabled,
      });

      return (
        <li className={classes.date} role="gridcell" key={formattedDate}>
          <Button
            className={classNames}
            disableFocusRipple
            disableRipple
            onClick={onDateClicked ? onDateClicked.bind(null, date) : undefined}
          >
            <time
              className={classes.dayButtonTime}
              dateTime={formattedDate}
              data-date={date}
            >
              {day}
            </time>
          </Button>
        </li>
      );
    });

  const renderDayOfWeek = (day: string) => (
    <li role="gridcell" key={day} className={classes.dayOfWeek}>
      {day}
    </li>
  );

  return (
    <section className={classes.calendar} style={style}>
      <header className={classes.header}>
        <span role="heading" className={classes.dayRange}>
          {firstDay} - {lastDay}
        </span>
      </header>
      <ul role="grid" className={classes.dates}>
        {renderDayOfWeek("Sun")}
        {renderDayOfWeek("Mon")}
        {renderDayOfWeek("Tue")}
        {renderDayOfWeek("Wed")}
        {renderDayOfWeek("Thu")}
        {renderDayOfWeek("Fri")}
        {renderDayOfWeek("Sat")}

        {renderDates()}
      </ul>
    </section>
  );
};

const useStyles = makeStyles<Theme, FiveWeekCalendarProps>(theme => ({
  calendar: {
    backgroundColor: props =>
      props.contained ? theme.customColors.white : "none",
    border: props =>
      props.contained ? "1px solid rgba(0, 0, 0, 0.23)" : "none",
    borderRadius: theme.typography.pxToRem(4),
    overflow: "hidden",
    padding: props => (props.contained ? theme.spacing(3) : 0),
    position: "relative",
    transition: "border-color 100ms linear",
    width: "100%",

    "&:hover": {
      borderColor: "rgba(0, 0, 0, 0.87)",
    },
  },
  header: {
    // Future proofing styling for adding functionality here later
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    paddingBottom: theme.spacing(3),
  },
  dayRange: {
    fontSize: theme.typography.pxToRem(14),
    lineHeight: 1,
    letterSpacing: theme.typography.pxToRem(0.1),
    fontWeight: 500,
    margin: 0,
  },
  dayOfWeek: {
    color: theme.customColors.darkGray,
    fontSize: theme.typography.pxToRem(12),
    lineHeight: theme.typography.pxToRem(15),
    paddingBottom: theme.spacing(1.5),
    textAlign: "center",
  },
  dates: {
    display: "grid",
    gridGap: theme.spacing(0.5),
    gridTemplateColumns: "repeat(7, 1fr)",
    listStyleType: "none",
    margin: 0,
    padding: 0,
  },
  date: {
    textAlign: "center",
  },
  dayButton: {
    cursor: "default",
    fontSize: theme.typography.pxToRem(16),
    fontWeight: "normal",
    maxWidth: theme.typography.pxToRem(48),
    minWidth: theme.typography.pxToRem(20),
    position: "relative",
    width: "100%",

    "&:after": {
      content: "''",
      display: "block",
      paddingBottom: "100%",
    },

    "&:hover": {
      backgroundColor: theme.customColors.white,
    },
  },
  dayButtonTime: {
    alignItems: "center",
    display: "flex",
    height: "100%",
    justifyContent: "center",
    position: "absolute",
    width: "100%",
  },
  daySelected: {
    backgroundColor: theme.palette.primary.main,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: theme.customColors.white,
    },
  },
  dayDisabled: {
    backgroundColor: theme.customColors.lightGray,
    color: theme.palette.text.disabled,

    "&:hover": {
      backgroundColor: theme.customColors.lightGray,
      color: theme.palette.text.disabled,
    },
  },
}));

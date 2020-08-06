import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button, { ButtonProps } from "@material-ui/core/Button";
import {
  eachDayOfInterval,
  format,
  isSameDay,
  lastDayOfMonth,
  startOfMonth,
  getDay,
} from "date-fns";
import clsx from "clsx";

type SingleMonthCalendarProps = {
  currentMonth: Date;
  customDates?: Array<{
    date: Date;
    buttonProps: ButtonProps;
    timeClass?: string;
  }>;
  onSelectDate?: (date: Date) => void;
  className?: string;
};

export const SingleMonthCalendar = (props: SingleMonthCalendarProps) => {
  const { customDates = [], currentMonth, onSelectDate = () => {} } = props;

  const classes = useStyles();

  const firstDay = startOfMonth(currentMonth);
  const lastDay = lastDayOfMonth(currentMonth);
  const firstDayOfMonthNumber = getDay(firstDay);
  const daysList = eachDayOfInterval({ start: firstDay, end: lastDay });
  const monthTitle = format(currentMonth, "MMMM yyyy");

  const renderDates = () => {
    return daysList.map((dayListDate, index) => {
      const day = format(dayListDate, "d");
      const formattedDate = format(dayListDate, "yyyy-MM-dd");

      const { buttonProps = {}, timeClass } =
        customDates.find(highlightedDate =>
          isSameDay(highlightedDate.date, dayListDate)
        ) || {};

      const buttonClassName = buttonProps.className
        ? buttonProps.className
        : "";

      const dayItemStyle =
        index === 0 ? { gridColumn: firstDayOfMonthNumber + 1 } : {};

      return (
        <li
          className={classes.date}
          style={dayItemStyle}
          role="gridcell"
          key={formattedDate}
        >
          <Button
            onClick={() => onSelectDate(dayListDate)}
            onKeyPress={() => onSelectDate(dayListDate)}
            {...buttonProps}
            className={`${classes.dayButton} ${buttonClassName}`}
          >
            <time
              className={clsx(classes.dayButtonTime, timeClass)}
              dateTime={formattedDate}
            >
              {day}
            </time>
          </Button>
        </li>
      );
    });
  };

  const renderDayOfWeek = (day: string) => (
    <li role="gridcell" key={day} className={classes.dayOfWeek}>
      {day}
    </li>
  );

  return (
    <section className={[classes.calendar, props.className].join(" ")}>
      <header className={classes.header}>
        <span role="heading" className={classes.calendarTitle}>
          {monthTitle}
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

const useStyles = makeStyles(theme => ({
  calendar: {
    backgroundColor: theme.customColors.white,
    border: "1px solid rgba(0, 0, 0, 0.23)",
    borderRadius: theme.typography.pxToRem(4),
    overflow: "hidden",
    padding: theme.spacing(3),
    position: "relative",
    transition: "border-color 100ms linear",
    width: "100%",

    "&:hover": {
      borderColor: "rgba(0, 0, 0, 0.87)",
    },
  },
  header: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    paddingBottom: theme.spacing(3),
  },
  calendarTitle: {
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
}));

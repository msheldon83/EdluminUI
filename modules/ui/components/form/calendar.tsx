import * as React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { CalendarProps } from "@material-ui/pickers/views/Calendar/Calendar";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  Calendar as MuiCalendar,
} from "@material-ui/pickers";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import { isEqual, format } from "date-fns";
import {
  isAfterDate,
  areDatesEqual,
  inDateInterval,
  PolymorphicDateType,
} from "../../../helpers/date";
import { CustomCalendar } from "./custom-calendar";

type Props = {
  elevated?: boolean;
  startDate?: Date;
  endDate?: Date | string;
  onChange?: (date: Date | undefined) => void;
  onMonthChange?: (date: Date) => void;
  disableDays?: boolean;
  disablePast?: boolean;
  disableFuture?: boolean;
  variant?: "weeks" | "month";
};

export const Calendar = (props: Props) => {
  const {
    startDate,
    endDate,
    elevated = false,
    onChange = () => {},
    onMonthChange = () => {},
    disableDays = false,
    disablePast = false,
    disableFuture = false,
    variant = "month",
  } = props;

  const classes = useStyles();

  // Track mouse position over dates
  const [dateHover, setDateHover] = React.useState<PolymorphicDateType>();

  // This makes it easier to compare dates
  startDate?.setHours(0, 0, 0, 0);

  // endDate can be undefined
  if (endDate instanceof Date) {
    endDate.setHours(0, 0, 0, 0);
  }

  // This should look like it's floating it's a dropdown style
  const elevation = elevated ? 2 : 0;

  const customDayRenderer = React.useCallback(
    (
      day: Date | null,
      selectedDate: Date | null,
      dayInCurrentMonth: boolean,
      dayComponent: JSX.Element
    ): JSX.Element => {
      /*
      The material-ui types say that date can be null here, but there's never a case in
      the UI where that can be true right now
    */
      if (!day) {
        return dayComponent;
      }

      const dayIsBetween =
        isAfterDate(endDate, startDate) &&
        inDateInterval(day, {
          start: startDate,
          end: endDate,
        });
      const isFirstDay = startDate ? isEqual(day, startDate) : false;
      const isLastDay = endDate ? areDatesEqual(day, endDate) : isFirstDay;
      const dayIsSelected = dayIsBetween || isFirstDay || isLastDay;

      /*
      Used to highlight a date that is between the start date and the date that has the
      mouse over it.

      If there is an end date, the highlight between start and end date shouldn't
      happen.
    */
      const dayIsBetweenHoverFocus =
        dateHover !== null &&
        isAfterDate(dateHover, startDate) &&
        inDateInterval(day, { start: startDate, end: dateHover }) &&
        !endDate;
      const dayIsHoverFocus =
        dayIsBetweenHoverFocus && areDatesEqual(dateHover, day);

      const wrapperClassName = clsx({
        [classes.highlight]: dayIsBetween,
        [classes.firstHighlight]: isFirstDay,
        [classes.endHighlight]: isLastDay,
        [classes.dayWrapper]: true,
        [classes.dateHoverFocus]: dayIsHoverFocus,
        [classes.dateHoverBetween]: dayIsBetweenHoverFocus,
      });

      const dayClassName = clsx(classes.day, {
        [classes.day]: true,
        [classes.nonCurrentMonthDay]: !dayInCurrentMonth,
        [classes.highlightNonCurrentMonthDay]:
          !dayInCurrentMonth && dayIsBetween,
        [classes.highlight]: dayIsSelected,
      });

      /*
      The calendar component doesn't let days in months not in the current month be actionable.
      This simulates that functionality. Here's the culprit:

      https://github.com/mui-org/material-ui-pickers/blob/next/lib/src/views/Calendar/DayWrapper.tsx#L24
    */
      const handleDayClick = () => {
        if (!dayInCurrentMonth && !disableDays) {
          onChange(day);
        }
      };

      return (
        <div
          className={wrapperClassName}
          onClick={handleDayClick}
          onKeyPress={handleDayClick}
          onMouseEnter={() => setDateHover(day)}
          onMouseLeave={() => setDateHover(undefined)}
        >
          <IconButton className={dayClassName} disableRipple>
            <span> {format(day, "d")} </span>
          </IconButton>
        </div>
      );
    },
    [classes, dateHover, disableDays, endDate, onChange, startDate]
  );

  const className = clsx({
    [classes.calendarWrapper]: true,
    [classes.calendarWrapperFloating]: elevated,
  });

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Paper elevation={elevation} square className={className}>
        <CustomCalendar
          month={startDate}
          contained={false}
          onMonthChange={onMonthChange}
          previousMonthNavigation
          nextMonthNavigation
          variant={variant}
          onSelectDates={dates => onChange(dates[0])}
        />
        {/*
          There is no easy to to disable day events, so this overlays the days and disables
          pointer events
        */}
        {disableDays && <div className={classes.disableCalendar} />}
      </Paper>
    </MuiPickersUtilsProvider>
  );
};

const useStyles = makeStyles(theme => ({
  datePickerWrapper: {
    position: "relative",
  },
  calendarWrapper: {
    backgroundColor: theme.customColors.white,
    border: "1px solid rgba(0, 0, 0, 0.23)",
    borderRadius: theme.typography.pxToRem(4),
    minWidth: theme.typography.pxToRem(300),
    overflow: "hidden",
    padding: theme.spacing(1.5),
    position: "relative",
    transition: "border-color 100ms linear",
    width: "100%",

    "&:hover": {
      borderColor: "rgba(0, 0, 0, 0.87)",
    },
  },
  disableCalendar: {
    left: 0,
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
  },
  calendarWrapperFloating: {
    borderWidth: 0,
    marginTop: theme.spacing(1),
  },
  day: {
    width: "100%",
    height: "100%",
    flex: "1 0 auto",
    fontSize: theme.typography.caption.fontSize,
    margin: 0,
    color: "inherit",
    borderRadius: theme.typography.pxToRem(4),
  },
  dayWrapper: {
    margin: `${theme.typography.pxToRem(2)} 0`,
  },
  customDayHighlight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "2px",
    right: "2px",
    border: `1px solid ${theme.palette.secondary.main}`,
  },
  nonCurrentMonthDay: {
    color: theme.palette.text.disabled,
    "&:hover": {
      color: "#676767",
    },
  },
  highlightNonCurrentMonthDay: {
    color: "#676767",
  },
  disabledDay: {
    backgroundColor: theme.customColors.lightGray,
    borderRadius: 0,
    cursor: "not-allowed",
    "&:hover": {
      backgroundColor: theme.customColors.lightGray,
      color: theme.palette.text.disabled,
    },
  },
  highlight: {
    background: theme.calendar.selected,
    color: theme.palette.common.white,
    "&:hover": {
      color: theme.palette.common.white,
    },
  },
  firstHighlight: {
    background: theme.calendar.selected,
    color: theme.palette.common.white,
    borderTopLeftRadius: theme.typography.pxToRem(4),
    borderBottomLeftRadius: theme.typography.pxToRem(4),
  },
  endHighlight: {
    background: theme.calendar.selected,
    color: theme.palette.common.white,
    borderTopRightRadius: theme.typography.pxToRem(4),
    borderBottomRightRadius: theme.typography.pxToRem(4),
  },
  dateHoverBetween: {
    background: theme.calendar.selected,
    color: theme.palette.common.white,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    "&:hover": {
      color: theme.palette.common.white,
    },
  },
  dateHoverFocus: {
    background: theme.calendar.selected,
    color: theme.palette.common.white,
    borderTopRightRadius: theme.typography.pxToRem(4),
    borderBottomRightRadius: theme.typography.pxToRem(4),
  },
}));

import * as React from "react";
import clsx from "clsx";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
  Calendar,
} from "@material-ui/pickers";
import TextField from "@material-ui/core/TextField";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import FormControl from "@material-ui/core/FormControl";
import { makeStyles } from "@material-ui/core/styles";
import format from "date-fns/format";
import isValid from "date-fns/isValid";
import isSameDay from "date-fns/isSameDay";
import endOfWeek from "date-fns/endOfWeek";
import startOfWeek from "date-fns/startOfWeek";
import isWithinInterval from "date-fns/isWithinInterval";
import isAfter from "date-fns/isAfter";
import isEqual from "date-fns/isEqual";
import { IconButton, withStyles } from "@material-ui/core";
import { Input } from "./input";

type DateInputProps = {
  label: string;
};

export const DateInput = (props: DateInputProps) => {
  const { label } = props;
  return <Input label={label} />;
};

type DatePickerProps = {
  startDate: Date;
  endDate: Date | null | undefined;
  onChange: ({ startDate: Date, endDate: Date }) => void;
  minimumDate?: Date;
  maximumDate?: Date;
};

export const DatePicker = (props: DatePickerProps) => {
  const classes = useStyles();

  const { startDate, endDate, onChange } = props;

  // Make sure that time plays no part in date comparisons
  startDate.setHours(0, 0, 0, 0);
  // endDate can be null
  endDate && endDate.setHours(0, 0, 0, 0);

  const customDayRenderer = (
    date: Date,
    selectedDate: Date,
    dayInCurrentMonth: boolean
  ) => {
    const dayIsBetween =
      endDate &&
      isWithinInterval(date, {
        start: startDate,
        end: endDate,
      });
    const isFirstDay = isEqual(date, startDate);
    const isLastDay = endDate ? isEqual(date, endDate) : isFirstDay;

    const wrapperClassName = clsx({
      [classes.highlight]: dayIsBetween,
      [classes.firstHighlight]: isFirstDay,
      [classes.endHighlight]: isLastDay,
      [classes.dayWrapper]: true,
    });

    const dayClassName = clsx(classes.day, {
      [classes.day]: true,
      [classes.nonCurrentMonthDay]: !dayInCurrentMonth,
      [classes.highlightNonCurrentMonthDay]: !dayInCurrentMonth && dayIsBetween,
    });

    return (
      <div className={wrapperClassName}>
        <IconButton className={dayClassName}>
          <span> {format(date, "d")} </span>
        </IconButton>
      </div>
    );
  };

  const handleDateChange = (date: Date) => {
    const isAfterStartDate = isAfter(date, startDate);
    let newStartDate = isAfterStartDate ? startDate : date;
    let newEndDate = isAfterStartDate ? date : endDate;

    if (endDate) {
      newStartDate = date;
      newEndDate = null;
    }

    onChange({ startDate: newStartDate, endDate: newEndDate });
  };

  const renderCalender = () => {
    return (
      <div className={classes.calendarWrapper}>
        <Calendar
          className={classes.calendar}
          date={startDate}
          onChange={handleDateChange}
          renderDay={customDayRenderer}
        />
      </div>
    );
  };

  const renderTextInputs = () => {
    return (
      <div className={classes.keyboardInputWrapper}>
        <div className={classes.startDateInput}>
          <DateInput label="From" />
        </div>
        <div className={classes.endDateInput}>
          <DateInput label="To" />
        </div>
      </div>
    );
  };

  /*
    TODO:
      * shouldDisableDate - disable days (if necessary)
  */

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      {renderTextInputs()}
      {renderCalender()}
    </MuiPickersUtilsProvider>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    maxWidth: theme.typography.pxToRem(500),
    width: "100%",
  },
  keyboardInputWrapper: {
    display: "flex",
    marginBottom: theme.spacing(1.5),
  },
  startDateInput: {
    backgroundColor: theme.customColors.white,
    marginRight: theme.spacing(1.5 / 2),
  },
  endDateInput: {
    backgroundColor: theme.customColors.white,
    marginLeft: theme.spacing(1.5 / 2),
  },
  calendarWrapper: {
    backgroundColor: theme.customColors.white,
    borderRadius: theme.typography.pxToRem(4),
    border: "1px solid rgba(0, 0, 0, 0.23)",
    padding: theme.spacing(1.5),
    overflow: "hidden",
    transition: "border-color 100ms linear",

    "&:hover": {
      borderColor: "rgba(0, 0, 0, 0.87)",
    },
  },
  calendar: {
    width: "100%",
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
    borderRadius: "50%",
  },
  nonCurrentMonthDay: {
    color: theme.palette.text.disabled,
  },
  highlightNonCurrentMonthDay: {
    color: "#676767",
  },
  highlight: {
    background: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  firstHighlight: {
    extend: "highlight",
    background: theme.palette.primary.main,
    color: theme.palette.common.white,
    borderTopLeftRadius: theme.typography.pxToRem(4),
    borderBottomLeftRadius: theme.typography.pxToRem(4),
  },
  endHighlight: {
    extend: "highlight",
    background: theme.palette.primary.main,
    color: theme.palette.common.white,
    borderTopRightRadius: theme.typography.pxToRem(4),
    borderBottomRightRadius: theme.typography.pxToRem(4),
  },
}));

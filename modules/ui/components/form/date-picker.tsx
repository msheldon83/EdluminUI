import * as React from "react";
import clsx from "clsx";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, Calendar } from "@material-ui/pickers";
import { makeStyles } from "@material-ui/core/styles";
import createDate from "sugar/date/create";
import isValid from "date-fns/isValid";
import format from "date-fns/format";
import isEqual from "date-fns/isEqual";
import addDays from "date-fns/addDays";
import { IconButton } from "@material-ui/core";
import { Input } from "./input";
import {
  isAfterDate,
  formatDateIfPossible,
  areDatesEqual,
  inDateInterval,
} from "../../../helpers/date";
import { useGuaranteedPreviousDate } from "../../../hooks/use-guaranteed-previous-date";

type DateInputProps = {
  label: string;
  value?: Date | string;
  onChange: (date: string) => void;
  onValidDate: (date: Date) => void;
};

export const DateInput = (props: DateInputProps) => {
  const { label, value = "", onValidDate, onChange } = props;

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleOnBlur = () => {
    let date = createDate(value);

    if (isValid(date)) {
      onValidDate(date);
    } else {
      date = value;
    }

    onChange(date);
  };

  const formattedValue = formatDateIfPossible(value, "MMM d, yyyy");

  return (
    <Input
      label={label}
      value={formattedValue}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
    />
  );
};

type DatePickerProps = {
  startDate: Date | string;
  endDate?: Date | string;
  onChange: ({ startDate, endDate }: onChangeType) => void;
  minimumDate?: Date;
  maximumDate?: Date;
};

type onChangeType = {
  startDate: Date | string;
  endDate?: Date | string;
};

export const DatePicker = (props: DatePickerProps) => {
  const { startDate, endDate, onChange } = props;

  const classes = useStyles();

  /*
    The calendar component requires that there always be a valid date value, so this hook tracks
    the last valid value (defaulting to the current date) and makes sure we can do date calculations
    with a guarenteed value
  */
  const guaranteedStartDate = useGuaranteedPreviousDate(startDate);
  const guaranteedEndDate = useGuaranteedPreviousDate(endDate);
  let calendarDate = guaranteedStartDate;

  // Make sure that time plays no part in date comparisons
  if (startDate instanceof Date) {
    startDate.setHours(0, 0, 0, 0);
    calendarDate = startDate;
  }
  // endDate can be undefined
  if (endDate instanceof Date) {
    endDate.setHours(0, 0, 0, 0);
  }

  const customDayRenderer = (
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

    let start = startDate;

    if (typeof start === "string") {
      start = guaranteedStartDate;
    }

    const dayIsBetween = inDateInterval(day, { start, end: endDate });
    const isFirstDay = isEqual(day, start);
    const isLastDay = endDate ? areDatesEqual(day, endDate) : isFirstDay;

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
          <span> {format(day, "d")} </span>
        </IconButton>
      </div>
    );
  };

  const handleEndDateInputChange = (newEndDate: Date | string) => {
    /*
      The material-ui types say that date can be null here, but there's never a case in
      the UI where that can be true right now
    */
    if (newEndDate === null) {
      return;
    }

    let newStartDate = startDate;

    // Not a valid date yet
    if (typeof newEndDate === "string") {
      onChange({ startDate: newStartDate, endDate: newEndDate });
      return;
    }

    const isAfterStartDate = isAfterDate(newEndDate, newStartDate);

    /*
      If the new date isn't after the start date, the start date needs to be reset to the day
      before
    */
    if (!isAfterStartDate) {
      newStartDate = addDays(newEndDate, -1);
    }

    onChange({ startDate: newStartDate, endDate: newEndDate });
  };

  const handleStartDateInputChange = (newStartDate: Date | string) => {
    /*
      The material-ui types say that date can be null here, but there's never a case in
      the UI where that can be true right now
    */
    if (newStartDate === null) {
      return;
    }

    let newEndDate = endDate;

    // Not a valid date yet
    if (typeof newStartDate == "string") {
      onChange({ startDate: newStartDate, endDate: newEndDate });
      return;
    }

    const isEndDateAfterStartDate = isAfterDate(newEndDate, newStartDate);

    // If the start date is after the end date, reset the end date
    if (!isEndDateAfterStartDate) {
      newEndDate = undefined;
    }

    onChange({ startDate: newStartDate, endDate: newEndDate });
  };

  const handleCalendarDateChange = (date: Date | string | null = "") => {
    /*
      The material-ui types say that date can be null here, but there's never a case in
      the UI where that can be true right now
    */
    if (date === null) {
      return;
    }

    let newStartDate = date;
    let newEndDate = endDate;

    // Not a valid date yet
    if (typeof date == "string") {
      onChange({ startDate: newStartDate, endDate: newEndDate });
      return;
    }

    const isAfterStartDate = isAfterDate(newStartDate, startDate);

    newStartDate = isAfterStartDate ? startDate : date;
    newEndDate = isAfterStartDate ? date : endDate;

    // Reset end if there is already one because the start date should always dictate the date range
    if (endDate) {
      newStartDate = date;
      newEndDate = undefined;
    }

    onChange({ startDate: newStartDate, endDate: newEndDate });
  };

  const renderCalender = () => {
    return (
      <div className={classes.calendarWrapper}>
        <Calendar
          date={calendarDate}
          onChange={handleCalendarDateChange}
          renderDay={customDayRenderer}
          allowKeyboardControl={false}
        />
      </div>
    );
  };

  const renderTextInputs = () => {
    return (
      <div className={classes.keyboardInputWrapper}>
        <div className={classes.startDateInput}>
          <DateInput
            label="From"
            value={startDate}
            /*
              The handler is used for both change and valid date ranges here to make the experience
              calculate at all the correct interaction timers
            */
            onChange={handleStartDateInputChange}
            onValidDate={handleStartDateInputChange}
          />
        </div>
        <div className={classes.endDateInput}>
          <DateInput
            label="To"
            value={endDate}
            onChange={handleEndDateInputChange}
            onValidDate={handleEndDateInputChange}
          />
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

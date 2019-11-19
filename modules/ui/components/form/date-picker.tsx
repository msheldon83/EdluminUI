import * as React from "react";
import clsx from "clsx";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, Calendar } from "@material-ui/pickers";
import { CalendarProps } from "@material-ui/pickers/views/Calendar/Calendar";
import { makeStyles } from "@material-ui/core/styles";
import createDate from "sugar/date/create";
import isValid from "date-fns/isValid";
import format from "date-fns/format";
import isEqual from "date-fns/isEqual";
import addDays from "date-fns/addDays";
import isSameDay from "date-fns/isSameDay";
import { IconButton } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import Fade from "@material-ui/core/Fade";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import { Input } from "./input";
import {
  isAfterDate,
  formatDateIfPossible,
  areDatesEqual,
  inDateInterval,
  PolymorphicDateType,
} from "../../../helpers/date";
import { useGuaranteedPreviousDate } from "../../../hooks/use-guaranteed-previous-date";

export type DatePickerOnMonthChange = CalendarProps["onMonthChange"];

type DatePickerProps = {
  startDate: Date | string;
  endDate?: Date | string;
  onChange: DatePickerOnChange;
  minimumDate?: Date;
  maximumDate?: Date;
  startLabel: string;
  endLabel?: string;
  dateFormat?: string;
  disableDates?: Array<Date>;
  onMonthChange?: DatePickerOnMonthChange;
  variant?: "single" | "single-hidden" | "range" | "extended-range";
};

export type DatePickerOnChange = (dates: {
  startDate: Date | string;
  endDate?: Date | string;
}) => void;

export const DEFAULT_DATE_FORMAT = "MMM d, yyyy";

export const DatePicker = (props: DatePickerProps) => {
  const {
    startDate,
    endDate,
    onChange,
    startLabel,
    endLabel,
    dateFormat,
    disableDates = [],
    variant = "range",
  } = props;

  const classes = useStyles(props);

  /*
    The calendar component requires that there always be a valid date value, so this hook tracks
    the last valid value (defaulting to the current date) and makes sure we can do date calculations
    with a guarenteed value
  */
  const guaranteedStartDate = useGuaranteedPreviousDate(startDate);
  let calendarDate = useGuaranteedPreviousDate(endDate);

  const [openCalendar, setOpenCalendar] = React.useState(false);
  const [calendarWidth, setCalendarWidth] = React.useState<string | number>(
    "100%"
  );
  const [dateHover, setDateHover] = React.useState<PolymorphicDateType>();

  let shouldShowRange = true;
  switch (variant) {
    case "single":
    case "single-hidden": {
      shouldShowRange = false;
      break;
    }
  }

  const showCalendarOnFocus = variant === "single-hidden";

  // Calculate width of input for calendar width
  const startDateInputRef = React.useRef(document.createElement("div"));
  React.useLayoutEffect(() => {
    if (showCalendarOnFocus) {
      const width = startDateInputRef.current.getBoundingClientRect().width;
      setCalendarWidth(width);
    }
  }, [startDateInputRef, showCalendarOnFocus]);

  // Make sure that time plays no part in date comparisons
  if (startDate instanceof Date) {
    startDate.setHours(0, 0, 0, 0);
    calendarDate = startDate;
  }
  // endDate can be undefined
  if (endDate instanceof Date) {
    endDate.setHours(0, 0, 0, 0);
  }

  const isDateDisabled = React.useCallback(
    (date: Date | null) => {
      if (date === null) {
        return false;
      }

      return disableDates.some(disabledDate => isSameDay(date, disabledDate));
    },
    [disableDates]
  );

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
    const dayIsSelected = dayIsBetween || isFirstDay || isLastDay;
    const isDisabled = isDateDisabled(day);

    /*
      Used to highlight a date that is between the start date and the date that has the
      mouse over it.

      If there is an end date, the highlight between start and end date shouldn't
      happen.
    */
    const dayIsBetweenHoverFocus =
      dateHover !== null &&
      isAfterDate(dateHover, start) &&
      inDateInterval(day, { start, end: dateHover }) &&
      !endDate &&
      shouldShowRange;
    const dayIsHoverFocus =
      dayIsBetweenHoverFocus && areDatesEqual(dateHover, day);

    const wrapperClassName = clsx({
      [classes.highlight]: dayIsBetween && !isDisabled,
      [classes.firstHighlight]: isFirstDay,
      [classes.endHighlight]: isLastDay,
      [classes.dayWrapper]: true,
      [classes.dateHoverFocus]: dayIsHoverFocus,
      [classes.dateHoverBetween]: dayIsBetweenHoverFocus,
    });

    const dayClassName = clsx(classes.day, {
      [classes.day]: true,
      [classes.nonCurrentMonthDay]: !dayInCurrentMonth || isDisabled,
      [classes.highlightNonCurrentMonthDay]: !dayInCurrentMonth && dayIsBetween,
      [classes.highlight]: dayIsSelected && !isDisabled,
      [classes.disabledDay]: isDisabled,
    });

    /*
      The calendar component doesn't let days in months not in the current month be actionable.
      This simulates that functionality. Here's the culprit:

      https://github.com/mui-org/material-ui-pickers/blob/next/lib/src/views/Calendar/DayWrapper.tsx#L24
    */
    const handleDayClick = () => {
      if (!dayInCurrentMonth && !isDisabled) {
        handleCalendarDateRangeChange(day);
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
  };

  const handleEndDateInputChange = React.useCallback(
    (newEndDate: Date | string) => {
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
    },
    [startDate, onChange]
  );

  const handleStartDateInputChange = React.useCallback(
    (newStartDate: Date | string) => {
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
    },
    [endDate, onChange]
  );

  const handleCalendarDateRangeChange = (date: Date | string | null = "") => {
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

  const handleCalendarSingleDateChange = (date: Date | string | null = "") => {
    /*
      The material-ui types say that date can be null here, but there's never a case in
      the UI where that can be true right now
    */
    if (date === null) {
      return;
    }

    onChange({ startDate: date });
  };

  const handleCalendarDateChange = (date: Date | string | null = "") => {
    // A slight delay _feels_ better
    setTimeout(() => setOpenCalendar(false), 10);

    switch (variant) {
      case "single": {
        handleCalendarSingleDateChange(date);
        break;
      }
      case "range": {
        handleCalendarDateRangeChange(date);
        break;
      }
    }
  };

  const renderCalendar = () => {
    // This should look like it's floating it's a dropdown style
    const elevation = showCalendarOnFocus ? 2 : 0;

    const className = clsx({
      [classes.calendarWrapper]: true,
      [classes.calendarWrapperFloating]: showCalendarOnFocus,
    });

    return (
      <Paper
        elevation={elevation}
        square
        className={className}
        style={{ width: calendarWidth }}
      >
        <Calendar
          date={guaranteedStartDate}
          onChange={handleCalendarDateChange}
          renderDay={customDayRenderer}
          allowKeyboardControl={false}
          shouldDisableDate={isDateDisabled}
          onMonthChange={props.onMonthChange}
        />
      </Paper>
    );
  };

  const renderPopoverCalendar = () => {
    return (
      <Popper
        transition
        anchorEl={startDateInputRef.current}
        open={openCalendar}
        placement="bottom-start"
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <div>
              <ClickAwayListener
                mouseEvent="onMouseDown"
                onClickAway={() => setOpenCalendar(false)}
              >
                {renderCalendar()}
              </ClickAwayListener>
            </div>
          </Fade>
        )}
      </Popper>
    );
  };

  const renderEndDate = () => {
    switch (variant) {
      case "single":
      case "single-hidden": {
        return;
      }
      default: {
        return (
          <div className={classes.endDateInput}>
            <DateInput
              label={endLabel || "(End Label Missing)"}
              value={endDate}
              onChange={handleEndDateInputChange}
              onValidDate={handleEndDateInputChange}
              dateFormat={dateFormat}
            />
          </div>
        );
      }
    }
  };

  const startDateStyle = () => {
    switch (variant) {
      case "single": {
        return { marginRight: 0 };
      }
      default: {
        return {};
      }
    }
  };

  const handleStartDateFocus = () => {
    if (showCalendarOnFocus) {
      setOpenCalendar(true);
    }
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <div className={classes.datePickerWrapper}>
        <div className={classes.keyboardInputWrapper}>
          <div className={classes.startDateInput} style={startDateStyle()}>
            <DateInput
              label={startLabel}
              value={startDate}
              /*
              The handler is used for both change and valid date ranges here to make the experience
              calculate at all the correct interaction timers
            */
              onChange={handleStartDateInputChange}
              onValidDate={handleStartDateInputChange}
              ref={startDateInputRef}
              onFocus={handleStartDateFocus}
              dateFormat={dateFormat}
            />
          </div>
          {renderEndDate()}
        </div>
        {showCalendarOnFocus ? renderPopoverCalendar() : renderCalendar()}
      </div>
    </MuiPickersUtilsProvider>
  );
};

const useStyles = makeStyles(theme => ({
  datePickerWrapper: {
    position: "relative",
  },
  keyboardInputWrapper: {
    display: "flex",
    marginBottom: theme.spacing(1.5),
  },
  startDateInput: {
    backgroundColor: theme.customColors.white,
    flexGrow: 1,
    marginRight: theme.spacing(1.5 / 2),
  },
  endDateInput: {
    backgroundColor: theme.customColors.white,
    marginLeft: theme.spacing(1.5 / 2),
  },
  calendarWrapper: {
    backgroundColor: theme.customColors.white,
    border: "1px solid rgba(0, 0, 0, 0.23)",
    borderRadius: theme.typography.pxToRem(4),
    minWidth: theme.typography.pxToRem(300),
    maxWidth: theme.typography.pxToRem(380),
    overflow: "hidden",
    padding: theme.spacing(1.5),
    transition: "border-color 100ms linear",
    width: "100%",

    "&:hover": {
      borderColor: "rgba(0, 0, 0, 0.87)",
    },
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
    background: theme.palette.primary.main,
    color: theme.palette.common.white,
    "&:hover": {
      color: theme.palette.common.white,
    },
  },
  firstHighlight: {
    background: theme.palette.primary.main,
    color: theme.palette.common.white,
    borderTopLeftRadius: theme.typography.pxToRem(4),
    borderBottomLeftRadius: theme.typography.pxToRem(4),
  },
  endHighlight: {
    background: theme.palette.primary.main,
    color: theme.palette.common.white,
    borderTopRightRadius: theme.typography.pxToRem(4),
    borderBottomRightRadius: theme.typography.pxToRem(4),
  },
  dateHoverBetween: {
    background: theme.palette.primary.main,
    color: theme.palette.common.white,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    "&:hover": {
      color: theme.palette.common.white,
    },
  },
  dateHoverFocus: {
    background: theme.palette.primary.main,
    color: theme.palette.common.white,
    borderTopRightRadius: theme.typography.pxToRem(4),
    borderBottomRightRadius: theme.typography.pxToRem(4),
  },
}));

// Single Date Input

type DateInputProps = {
  label: string;
  value?: Date | string;
  onChange: (date: string) => void;
  onValidDate: (date: Date) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  dateFormat?: string;
};

export const DateInput = React.forwardRef((props: DateInputProps, ref) => {
  const {
    label,
    value = "",
    onValidDate,
    onChange,
    onFocus,
    onBlur = () => {},
    dateFormat = DEFAULT_DATE_FORMAT,
  } = props;

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

    onBlur();
    onChange(date);
  };

  const formattedValue = formatDateIfPossible(value, dateFormat);

  return (
    <Input
      label={label}
      value={formattedValue}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
      onFocus={onFocus}
      ref={ref}
    />
  );
});

import * as React from "react";
import { CalendarProps } from "@material-ui/pickers/views/Calendar/Calendar";
import { makeStyles } from "@material-ui/core/styles";
import createDate from "sugar/date/create";
import isValid from "date-fns/isValid";
import addDays from "date-fns/addDays";
import isSameDay from "date-fns/isSameDay";
import Popper from "@material-ui/core/Popper";
import Fade from "@material-ui/core/Fade";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import { Input } from "./input";
import {
  isAfterDate,
  formatDateIfPossible,
  PolymorphicDateType,
} from "../../../helpers/date";
import { useGuaranteedPreviousDate } from "../../../hooks/use-guaranteed-previous-date";
import { Calendar } from "./calendar";

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

  const [openCalendar, setOpenCalendar] = React.useState(false);
  const [calendarWidth, setCalendarWidth] = React.useState<string | number>(
    "100%"
  );

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
    // calendarDate = startDate;
  }
  // endDate can be undefined
  if (endDate instanceof Date) {
    endDate.setHours(0, 0, 0, 0);
  }

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

  const handleCalendarDateRangeChange = React.useCallback(
    (date: Date | string | null = "") => {
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
    },
    [endDate, startDate, onChange]
  );

  const handleCalendarSingleDateChange = React.useCallback(
    (date: Date | string | null = "") => {
      /*
      The material-ui types say that date can be null here, but there's never a case in
      the UI where that can be true right now
    */
      if (date === null) {
        return;
      }

      onChange({ startDate: date });
    },
    [onChange]
  );

  const handleCalendarDateChange = React.useCallback(
    (date: Date | string | null = "") => {
      // A slight delay _feels_ better
      setTimeout(() => setOpenCalendar(false), 10);

      switch (variant) {
        case "single":
        case "single-hidden": {
          handleCalendarSingleDateChange(date);
          break;
        }
        case "range":
        case "extended-range": {
          handleCalendarDateRangeChange(date);
          break;
        }
      }
    },
    [handleCalendarDateRangeChange, handleCalendarSingleDateChange, variant]
  );

  const renderCalendar = React.useCallback(() => {
    const start = startDate instanceof Date ? startDate : guaranteedStartDate;

    return (
      <div style={{ width: calendarWidth }}>
        <Calendar
          startDate={start}
          endDate={endDate}
          onChange={handleCalendarDateChange}
          onMonthChange={props.onMonthChange}
          disabledDates={disableDates}
          range={shouldShowRange}
          elevated={showCalendarOnFocus}
        />
      </div>
    );
  }, [
    disableDates,
    startDate,
    endDate,
    guaranteedStartDate,
    handleCalendarDateChange,
    props.onMonthChange,
    shouldShowRange,
    calendarWidth,
    showCalendarOnFocus,
  ]);

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
    flexGrow: 1,
    marginLeft: theme.spacing(1.5 / 2),
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

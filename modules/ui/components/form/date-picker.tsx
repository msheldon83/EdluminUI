import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Fade from "@material-ui/core/Fade";
import Popper from "@material-ui/core/Popper";
import { makeStyles } from "@material-ui/core/styles";
import { CalendarProps } from "@material-ui/pickers/views/Calendar/Calendar";
import addDays from "date-fns/addDays";
import * as React from "react";
import { useState } from "react";
import { isAfterDate } from "../../../helpers/date";
import { useGuaranteedPreviousDate } from "../../../hooks/use-guaranteed-previous-date";
import { Calendar } from "./calendar";
import { DateInput } from "./date-input";

export type DatePickerOnMonthChange = CalendarProps["onMonthChange"];

type DatePickerProps = {
  startDate: Date | string;
  endDate?: Date | string;
  onChange: DatePickerOnChange;
  startLabel?: string;
  endLabel?: string;
  dateFormat?: string;
  onMonthChange?: DatePickerOnMonthChange;
  variant?: "single" | "single-hidden" | "range" | "extended-range";
  endAdornment?: React.ReactNode;
  inputStatus?: "warning" | "error" | "success" | "default" | null;
  validationMessage?: any;
  placeholder?: string;
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
    endAdornment,
    variant = "range",
    placeholder,
    inputStatus,
    validationMessage,
  } = props;

  const classes = useStyles(props);

  const [inputStartDate, setInputStartDate] = useState<
    string | Date | undefined
  >(undefined);
  const [inputEndDate, setInputEndDate] = useState<string | Date | undefined>(
    undefined
  );

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

  // Calculate width of input for calendar width for use with single-hidden variant
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
        setInputEndDate(undefined);
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
      setInputEndDate(undefined);
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
        setInputStartDate(undefined);
        return;
      }

      const isEndDateAfterStartDate = isAfterDate(newEndDate, newStartDate);

      // If the start date is after the end date, reset the end date
      if (!isEndDateAfterStartDate) {
        newEndDate = undefined;
      }

      onChange({ startDate: newStartDate, endDate: newEndDate });
      setInputStartDate(undefined);
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
        setInputStartDate(undefined);
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
      setInputStartDate(undefined);
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

      setInputStartDate(undefined);
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
          range={shouldShowRange}
          elevated={showCalendarOnFocus}
        />
      </div>
    );
  }, [
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
        // modal has a z-index of 1300 per https://github.com/mui-org/material-ui/issues/18905#issuecomment-566799469
        style={{ zIndex: 1301 }}
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

  let showCalendar: null | { render: () => JSX.Element };
  switch (variant) {
    case "single-hidden":
      showCalendar = { render: renderPopoverCalendar };
      break;
    default:
      showCalendar = { render: renderCalendar };
      break;
  }

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
              value={inputEndDate || endDate}
              onChange={(date: string) => setInputEndDate(date)}
              onValidDate={handleEndDateInputChange}
              dateFormat={dateFormat}
              onBlur={() => setInputEndDate(undefined)}
              inputStatus={inputStatus}
              validationMessage={validationMessage}
              placeholder={placeholder}
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

  const renderInputs = () => {
    return (
      <>
        <div className={classes.startDateInput} style={startDateStyle()}>
          <DateInput
            label={startLabel || ""}
            value={inputStartDate === undefined ? startDate : inputStartDate}
            /*
              The handler is used for both change and valid date ranges here to make the experience
              calculate at all the correct interaction timers
            */
            onChange={(date: string) => setInputStartDate(date)}
            onValidDate={handleStartDateInputChange}
            ref={startDateInputRef}
            onFocus={handleStartDateFocus}
            dateFormat={dateFormat}
            placeholder={placeholder}
            endAdornment={endAdornment}
            onBlur={() => {
              /* ml - 1/31/20. This is not a great solution for the timing issue here.
                 This timeout will let the onBlur fire after the competing state update.
               */
              setTimeout(() => setInputStartDate(undefined), 1);
            }}
            inputStatus={inputStatus}
            validationMessage={validationMessage}
          />
        </div>
        {renderEndDate()}
      </>
    );
  };

  return (
    <div className={classes.datePickerWrapper}>
      <div className={classes.keyboardInputWrapper}>{renderInputs()}</div>
      {showCalendar && showCalendar.render()}
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

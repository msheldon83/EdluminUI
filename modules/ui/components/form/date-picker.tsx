import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Fade from "@material-ui/core/Fade";
import Popper from "@material-ui/core/Popper";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import clsx from "clsx";
import Paper from "@material-ui/core/Paper";
import { CalendarProps } from "@material-ui/pickers/views/Calendar/Calendar";
import DateFnsUtils from "@date-io/date-fns";
import addDays from "date-fns/addDays";
import * as React from "react";
import { useState } from "react";
import { isAfterDate } from "../../../helpers/date";
import { useGuaranteedPreviousDate } from "../../../hooks/use-guaranteed-previous-date";
import { CustomCalendar, CustomDate } from "./custom-calendar";
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
  variant?: "single" | "single-hidden";
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
  const theme = useTheme();

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
  const [visbibleMonth, setVisibleMonth] = useState<Date>(
    startDate instanceof Date ? startDate : guaranteedStartDate
  );

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

      if (variant === "single" || variant === "single-hidden") {
        handleCalendarSingleDateChange(date);
      }
    },
    [handleCalendarSingleDateChange, variant]
  );

  const renderCalendarWrapper = React.useCallback(
    (children: React.ReactElement) => {
      if (!showCalendarOnFocus) {
        return children;
      }

      const className = clsx({
        [classes.calendarWrapper]: true,
        [classes.calendarWrapperFloating]: true,
      });

      return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Paper elevation={2} square className={className}>
            {children}
          </Paper>
        </MuiPickersUtilsProvider>
      );
    },
    [
      classes.calendarWrapper,
      classes.calendarWrapperFloating,
      showCalendarOnFocus,
    ]
  );

  const customDates = React.useMemo(() => {
    switch (variant) {
      case "single-hidden":
      case "single": {
        return startDate instanceof Date
          ? [
              {
                date: startDate,
                buttonProps: {
                  style: {
                    background: theme.calendar.selected,
                    color: theme.customColors.white,
                  },
                },
              },
            ]
          : [];
      }
      default: {
        return [];
      }
    }
  }, [startDate, theme.calendar.selected, theme.customColors.white, variant]);

  const renderCalendar = () => {
    return (
      <div style={{ width: calendarWidth }}>
        {renderCalendarWrapper(
          <CustomCalendar
            month={visbibleMonth}
            contained={!showCalendarOnFocus}
            previousMonthNavigation
            nextMonthNavigation
            variant="month"
            customDates={customDates}
            onSelectDates={dates => {
              const date = dates[0] ?? "";

              handleCalendarDateChange(date);
            }}
            onMonthChange={date => setVisibleMonth(date)}
          />
        )}
      </div>
    );
  };

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
  calendarWrapperFloating: {
    borderWidth: 0,
    marginTop: theme.spacing(1),
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
}));

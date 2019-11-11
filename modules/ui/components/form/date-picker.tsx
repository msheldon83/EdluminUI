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
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import Fade from "@material-ui/core/Fade";
import { Input } from "./input";
import {
  isAfterDate,
  formatDateIfPossible,
  areDatesEqual,
  inDateInterval,
} from "../../../helpers/date";
import { useGuaranteedPreviousDate } from "../../../hooks/use-guaranteed-previous-date";

type DatePickerProps = {
  startDate: Date | string;
  endDate?: Date | string;
  onChange: DatePickerOnChange;
  minimumDate?: Date;
  maximumDate?: Date;
  singleDate?: boolean;
  showCalendarOnFocus?: boolean;
  startLabel: string;
  endLabel: string;
};

export type DatePickerOnChange = (dates: {
  startDate: Date | string;
  endDate?: Date | string;
}) => void;

export const DatePicker = (props: DatePickerProps) => {
  const {
    startDate,
    endDate,
    onChange,
    singleDate = false,
    showCalendarOnFocus = false,
    startLabel,
    endLabel,
  } = props;

  const classes = useStyles(props);

  /*
    The calendar component requires that there always be a valid date value, so this hook tracks
    the last valid value (defaulting to the current date) and makes sure we can do date calculations
    with a guarenteed value
  */
  const guaranteedStartDate = useGuaranteedPreviousDate(startDate);
  const guaranteedEndDate = useGuaranteedPreviousDate(endDate);
  let calendarDate = guaranteedStartDate;

  const [openCalendar, setOpenCalendar] = React.useState(false);
  const [calenderWidth, setCalenderWidth] = React.useState<string | number>(
    "100%"
  );

  // Calculate width of input for calendar width
  const startDateInputRef = React.useRef(document.createElement("div"));
  React.useLayoutEffect(() => {
    if (showCalendarOnFocus) {
      const width = startDateInputRef.current.getBoundingClientRect().width;
      setCalenderWidth(width);
    }
  }, [startDateInputRef]);

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
    singleDate
      ? handleCalendarSingleDateChange(date)
      : handleCalendarDateRangeChange(date);
  };

  const renderCalender = () => {
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
        style={{ width: calenderWidth }}
      >
        <Calendar
          date={calendarDate}
          onChange={handleCalendarDateChange}
          renderDay={customDayRenderer}
          allowKeyboardControl={false}
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
            {renderCalender()}
          </Fade>
        )}
      </Popper>
    );
  };

  const handleStartDateFocus = () => {
    if (showCalendarOnFocus) {
      setOpenCalendar(true);
    }
  };

  const renderTextInputs = () => {
    const startDateStyle = singleDate ? { marginRight: 0 } : {};

    return (
      <div className={classes.keyboardInputWrapper}>
        <div className={classes.startDateInput} style={startDateStyle}>
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
          />
        </div>
        {!singleDate && (
          <div className={classes.endDateInput}>
            <DateInput
              label={endLabel}
              value={endDate}
              onChange={handleEndDateInputChange}
              onValidDate={handleEndDateInputChange}
            />
          </div>
        )}
      </div>
    );
  };

  /*
    TODO:
      * shouldDisableDate - disable days (if necessary)
  */

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <div className={classes.datePickerWrapper}>
        {renderTextInputs()}
        {showCalendarOnFocus ? renderPopoverCalendar() : renderCalender()}
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

// Single Date Input

type DateInputProps = {
  label: string;
  value?: Date | string;
  onChange: (date: string) => void;
  onValidDate: (date: Date) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

export const DateInput = React.forwardRef((props: DateInputProps, ref) => {
  const {
    label,
    value = "",
    onValidDate,
    onChange,
    onFocus,
    onBlur = () => {},
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

  const formattedValue = formatDateIfPossible(value, "MMM d, yyyy");

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

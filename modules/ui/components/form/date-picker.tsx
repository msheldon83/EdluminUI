import * as React from "react";
import clsx from "clsx";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, Calendar } from "@material-ui/pickers";
import { makeStyles } from "@material-ui/core/styles";
import createDate from "sugar/date/create";
import parseISO from "date-fns/parseISO";
import isValid from "date-fns/isValid";
import isDate from "date-fns/isDate";
import format from "date-fns/format";
import isWithinInterval from "date-fns/isWithinInterval";
import isAfter from "date-fns/isAfter";
import isBefore from "date-fns/isBefore";
import isEqual from "date-fns/isEqual";
import addDays from "date-fns/addDays";
import { IconButton, withStyles } from "@material-ui/core";
import { Input } from "./input";

type DateInputProps = {
  label: string;
  value?: Date | string;
  onChange: (date: string) => void;
  onValidDate: (date: Date) => void;
};

export const DateInput = (props: DateInputProps) => {
  const { label, value = "", onValidDate, onChange } = props;

  // const [rawValue, setRawValue] = React.useState<
  //   Date | string | null | undefined
  // >(value);

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

  const formatDateOrNot = (date: Date | string | undefined | null) => {
    if (!date) {
      return "";
    }

    if (typeof date === "string") {
      return date;
    }

    if (!isValid(date)) {
      return date;
    }

    return format(date, "MMM d, yyyy");
  };

  const formattedValue = formatDateOrNot(value);

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
  const classes = useStyles();

  const { startDate, endDate, onChange } = props;

  // Make sure that time plays no part in date comparisons
  // startDate.setHours(0, 0, 0, 0);
  // endDate can be null
  // endDate && endDate.setHours(0, 0, 0, 0);

  // const customDayRenderer = (
  //   date: Date | null,
  //   selectedDate: Date | null,
  //   dayInCurrentMonth: boolean,
  //   dayComponent: JSX.Element
  // ): JSX.Element => {
  //   /*
  //     The material-ui types say that date can be null here, but there's never a case in
  //     the UI where that can be true right now
  //   */
  //   if (!date) {
  //     return dayComponent;
  //   }

  //   const dayIsBetween =
  //     endDate &&
  //     isWithinInterval(date, {
  //       start: startDate,
  //       end: endDate,
  //     });
  //   const isFirstDay = isEqual(date, startDate);
  //   const isLastDay = endDate ? isEqual(date, endDate) : isFirstDay;

  //   const wrapperClassName = clsx({
  //     [classes.highlight]: dayIsBetween,
  //     [classes.firstHighlight]: isFirstDay,
  //     [classes.endHighlight]: isLastDay,
  //     [classes.dayWrapper]: true,
  //   });

  //   const dayClassName = clsx(classes.day, {
  //     [classes.day]: true,
  //     [classes.nonCurrentMonthDay]: !dayInCurrentMonth,
  //     [classes.highlightNonCurrentMonthDay]: !dayInCurrentMonth && dayIsBetween,
  //   });

  //   return (
  //     <div className={wrapperClassName}>
  //       <IconButton className={dayClassName}>
  //         <span> {format(date, "d")} </span>
  //       </IconButton>
  //     </div>
  //   );
  // };

  const isAfterDate = (date1: Date | string, date2: Date | string) => {
    if (typeof date2 === "string" || typeof date1 === "string") {
      return false;
    }

    return isAfter(date1, date2);
  };

  const handleEndDateInputChange = (newEndDate: Date | string = "") => {
    /*
      The material-ui types say that date can be null here, but there's never a case in
      the UI where that can be true right now
    */
    if (newEndDate === null) {
      return;
    }

    let newStartDate = startDate;

    // Not a valid date yet
    if (typeof newEndDate == "string") {
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

  const handleStartDateInputChange = (newStartDate: Date | string = "") => {
    /*
      The material-ui types say that date can be null here, but there's never a case in
      the UI where that can be true right now
    */
    if (newStartDate === null) {
      return;
    }

    let newEndDate = endDate || "";

    // Not a valid date yet
    if (typeof newStartDate == "string") {
      onChange({ startDate: newStartDate, endDate: newEndDate });
      return;
    }

    const isStartDateAfterEndDate = isAfterDate(newStartDate, newEndDate);

    // If the start date is after the end date, reset the end date
    if (isStartDateAfterEndDate) {
      newEndDate = "";
    }

    onChange({ startDate: newStartDate, endDate: newEndDate });
  };

  const handleDateChange = (position: "start" | "end") => (
    date: Date | string | null = ""
  ) => {
    /*
      The material-ui types say that date can be null here, but there's never a case in
      the UI where that can be true right now
    */
    if (date === null) {
      return;
    }

    let newStartDate = position === "start" ? date : startDate;
    let newEndDate = position === "end" ? date : endDate;

    // Not a valid date yet
    if (typeof date == "string") {
      onChange({ startDate: newStartDate, endDate: newEndDate });
      return;
    }

    /*
    TODO:
      if th enew end date is after the start date, change the start date to the end
      date and the end date to the date after the start date
    */

    // const isAfterStartDate = isAfterDate(newStartDate, startDate);

    // newStartDate = isAfterStartDate ? startDate : date;
    // newEndDate = isAfterStartDate ? date : endDate;

    // if (endDate) {
    //   newStartDate = date;
    //   newEndDate = "";
    // }

    onChange({ startDate: newStartDate, endDate: newEndDate });
  };

  const renderCalender = () => {
    return null;
    // return (
    //   <div className={classes.calendarWrapper}>
    //     <Calendar
    //       date={startDate}
    //       onChange={handleDateChange}
    //       renderDay={customDayRenderer}
    //       allowKeyboardControl={false}
    //     />
    //   </div>
    // );
  };

  const renderTextInputs = () => {
    return (
      <div className={classes.keyboardInputWrapper}>
        <div className={classes.startDateInput}>
          <DateInput
            label="From"
            value={startDate}
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

  return renderTextInputs();
  // <MuiPickersUtilsProvider utils={DateFnsUtils}>
  // {renderCalender()}
  // </MuiPickersUtilsProvider>
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

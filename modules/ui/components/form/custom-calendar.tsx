import Button, { ButtonProps } from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import clsx from "clsx";
import addDays from "date-fns/addDays";
import addMonths from "date-fns/addMonths";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import endOfMonth from "date-fns/endOfMonth";
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import isSameDay from "date-fns/isSameDay";
import isWeekend from "date-fns/isWeekend";
import startOfMonth from "date-fns/startOfMonth";
import startOfWeek from "date-fns/startOfWeek";
import { inDateInterval, sortDates } from "helpers/date";
import * as React from "react";

type CustomCalendarProps = {
  contained?: boolean;
  style?: React.CSSProperties;
  onSelectDates?: (dates: Array<Date>) => void;
  month?: Date;
  customDates?: Array<{
    date: Date;
    buttonProps: ButtonProps;
  }>;
  variant?: "weeks" | "month";
  onMonthChange?: (date: Date) => void;
  previousMonthNavigation?: boolean;
  nextMonthNavigation?: boolean;
  classes?: Classes;
};

type Classes = {
  weekend?: string;
  weekday?: string;
};

export const CustomCalendar = (props: CustomCalendarProps) => {
  const {
    contained = true,
    style = {},
    onSelectDates,
    month = new Date(),
    customDates = [],
    onMonthChange = () => {},
    previousMonthNavigation = false,
    nextMonthNavigation = false,
    variant = "weeks",
    classes: customClasses = {},
  } = props;

  const classes = useStyles({ contained, onSelectDates });
  const [shiftPressed, setShiftPressed] = React.useState(false);
  const [lastDateSelected, setLastDateSelected] = React.useState();
  const [mouseOverDate, setMouseOverDate] = React.useState();

  const handleKeyPress = (e: KeyboardEvent) =>
    setShiftPressed(e.key === "Shift");
  const handleKeyUp = (e: KeyboardEvent) =>
    setShiftPressed(e.key === "Shift" && false);

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const getStartDate = (month: Date) => {
    switch (variant) {
      case "weeks": {
        return startOfWeek(month);
      }
      case "month": {
        return startOfMonth(month);
      }
    }
  };

  const getEndDate = (month: Date) => {
    switch (variant) {
      case "weeks": {
        return addDays(startDate, 34);
      }
      case "month": {
        return endOfMonth(month);
      }
    }
  };

  const startDate = getStartDate(month);
  const firstDayOfMonthNumber = getDay(startDate);
  const daysList = eachDayOfInterval({
    start: startDate,
    end: getEndDate(startDate),
  });

  const calendarTitle = () => {
    switch (variant) {
      case "weeks": {
        const firstDayText = format(startDate, "LLL d");
        const lastDayText = format(daysList[daysList.length - 1], "LLL d");
        return `${firstDayText} - ${lastDayText}`;
      }
      case "month": {
        return format(startDate, "MMMM yyyy");
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    if (!onSelectDates) {
      return;
    }

    // Make it only about the actual date
    date.setHours(0, 0, 0, 0);

    // Always make sure that the start date is before the end date
    const { earlier, later } =
      shiftPressed && lastDateSelected
        ? sortDates(lastDateSelected, date)
        : {
            earlier: date,
            later: date,
          };

    const dayRange =
      shiftPressed && lastDateSelected && !isSameDay(lastDateSelected, date)
        ? eachDayOfInterval({ start: earlier, end: later })
        : [date];

    onSelectDates(dayRange);

    // Keep track of the last date selected for use with the shift key and selecting date ranges
    setLastDateSelected(date);
  };

  const dateIsInSelectionRange = (date: Date) => {
    try {
      const { earlier, later } = sortDates(lastDateSelected, mouseOverDate);

      return (
        shiftPressed &&
        lastDateSelected &&
        mouseOverDate &&
        inDateInterval(date, {
          start: earlier,
          end: later,
        })
      );
    } catch (e) {
      return false;
    }
  };

  const handlePreviousMonthClick = React.useCallback(() => {
    onMonthChange(addMonths(month, -1));
  }, [month, onMonthChange]);

  const handleNextMonthClick = React.useCallback(() => {
    onMonthChange(addMonths(month, 1));
  }, [month, onMonthChange]);

  const handleCurrentMonthClick = () => {
    onMonthChange(new Date());
  };

  const renderDates = () =>
    daysList.map((date, index) => {
      const day = format(date, "d");
      const formattedDate = format(date, "yyyy-MM-dd");

      const { buttonProps = {} } =
        customDates.find(highlightedDate =>
          isSameDay(highlightedDate.date, date)
        ) || {};

      const buttonClassName = buttonProps.className
        ? buttonProps.className
        : "";

      const dateIsWeekend = isWeekend(date);

      const classNames = clsx({
        [classes.dayButton]: true,
        [classes.dayInDateRange]: dateIsInSelectionRange(date),
        [classes.dayShiftPressed]: shiftPressed,
        [customClasses.weekend ?? ""]: dateIsWeekend,
        [customClasses.weekday ?? ""]: !dateIsWeekend,
      });

      /*
        Start rendering the first day of the month in the correct column, only for the month
        variant
      */
      const dayItemStyle =
        index === 0 && variant === "month"
          ? { gridColumn: firstDayOfMonthNumber + 1 }
          : {};

      return (
        <li
          className={classes.date}
          style={dayItemStyle}
          role="gridcell"
          key={formattedDate}
        >
          <Button
            disableFocusRipple
            disableRipple
            disableElevation
            onClick={() => handleDateSelect(date)}
            onKeyPress={() => handleDateSelect(date)}
            onMouseEnter={() => setMouseOverDate(date)}
            onMouseLeave={() => setMouseOverDate(undefined)}
            {...buttonProps}
            className={`${classNames} ${buttonClassName}`}
          >
            <time
              className={classes.dayButtonTime}
              dateTime={formattedDate}
              data-date={date}
            >
              {day}
            </time>
          </Button>
        </li>
      );
    });

  const renderDayOfWeek = (day: string) => (
    <li role="gridcell" key={day} className={classes.dayOfWeek}>
      {day}
    </li>
  );

  return (
    <section className={classes.calendar} style={style}>
      <header className={classes.header}>
        <span className={classes.monthNavButton}>
          {previousMonthNavigation && (
            <IconButton
              arial-label="view previous month"
              onClick={handlePreviousMonthClick}
            >
              <ArrowBackIosIcon fontSize="small" />
            </IconButton>
          )}
        </span>

        <span role="heading" className={classes.dayRange}>
          {nextMonthNavigation || previousMonthNavigation ? (
            <Button
              onClick={handleCurrentMonthClick}
              className={classes.titleButton}
            >
              {calendarTitle()}
            </Button>
          ) : (
            calendarTitle()
          )}
        </span>

        <span className={classes.monthNavButton}>
          {nextMonthNavigation && (
            <IconButton
              arial-label="view next month"
              onClick={handleNextMonthClick}
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          )}
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

// Helper to manage a list of dates
export const useToggleDatesList = (defaultDates: Array<Date> = []) => {
  const defaultDateSet = new Set<number>(
    defaultDates.map(date => date.getTime())
  );
  const [selectedDates, setSelectedDatesState] = React.useState(defaultDateSet);

  const toggleSelectedDates = (dates: Array<Date>) => {
    const datesToRemove = dates.filter(date => {
      return selectedDates.has(date.getTime());
    });

    const newDates = new Set(
      [...selectedDates].concat(dates.map(date => date.getTime()))
    );

    datesToRemove.forEach(date => {
      newDates.delete(date.getTime());
    });

    setSelectedDatesState(newDates);
  };

  const setSelectedDates = (dates: Array<Date>) => {
    const newDates = new Set(
      [...selectedDates].concat(dates.map(date => date.getTime()))
    );
    setSelectedDatesState(newDates);
  };

  return { selectedDates, toggleSelectedDates, setSelectedDates };
};

const useStyles = makeStyles<Theme, CustomCalendarProps>(theme => ({
  calendar: {
    backgroundColor: props =>
      props.contained ? theme.customColors.white : "none",
    border: props =>
      props.contained
        ? `1px solid ${theme.customColors.edluminSubText}`
        : "none",
    borderRadius: theme.typography.pxToRem(4),
    overflow: "hidden",
    padding: props => (props.contained ? theme.spacing(3) : 0),
    position: "relative",
    transition: "border-color 100ms linear",
    width: "100%",

    "&:hover": {
      borderColor: "rgba(0, 0, 0, 0.87)",
    },
  },
  header: {
    // Future proofing styling for adding functionality here later
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    paddingBottom: theme.spacing(3),
  },
  titleButton: {
    letterSpacing: theme.typography.pxToRem(0.15),
  },
  monthNavButton: {
    height: theme.typography.pxToRem(44),
    width: theme.typography.pxToRem(44),
  },
  dayRange: {
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
    cursor: props => (props.onSelectDates ? "pointer" : "default"),
    fontSize: theme.typography.pxToRem(16),
    fontWeight: "normal",
    maxWidth: theme.typography.pxToRem(48),
    minWidth: theme.typography.pxToRem(20),
    position: "relative",
    width: "100%",
    transition: "none",

    pointerEvents: props => (props.onSelectDates ? "auto" : "none"),

    "&:after": {
      content: "''",
      display: "block",
      paddingBottom: "100%",
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
  dayInDateRange: {
    backgroundColor: theme.customColors.lightGray,
  },
  dayShiftPressed: {
    "&:hover": {
      backgroundColor: theme.customColors.lightGray,
    },
  },
  dayDisabled: {
    backgroundColor: theme.customColors.lightGray,
    color: theme.palette.text.disabled,

    "&:hover": {
      backgroundColor: theme.customColors.lightGray,
      color: theme.palette.text.disabled,
    },
  },
}));

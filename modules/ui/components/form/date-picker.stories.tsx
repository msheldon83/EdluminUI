import * as React from "react";
import { action } from "@storybook/addon-actions";
import { text, boolean, date, select } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import endOfTomorrow from "date-fns/endOfTomorrow";
import endOfYesterday from "date-fns/endOfYesterday";
import addDays from "date-fns/addDays";
import { DatePicker, DEFAULT_DATE_FORMAT } from "./date-picker";
import { Calendar } from "./calendar";
import { SingleMonthCalendar } from "./single-month-calendar";
import { CustomCalendar, useToggleDatesList } from "./custom-calendar";
import { DateRangePicker } from "./date-range-picker";
import { DateRangePickerPopover } from "./date-range-picker-popover";

export default {
  title: "Forms/Date Picker",
};

const minimumDate = addDays(endOfYesterday(), -15);
const maximumDate = addDays(endOfTomorrow(), 15);

const customDate = (name: string, defaultValue?: Date): Date => {
  const value = date(name, defaultValue);

  const d = new Date(value);
  return new Date(d);
};

export const DateRangePickerStory = () => {
  const classes = useStyles();

  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();

  return (
    <div className={classes.container} style={{ maxWidth: "700px" }}>
      <DateRangePicker
        contained={boolean("contained", false)}
        startDate={startDate}
        endDate={endDate}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onDateRangeSelected={(start, end) => {
          action("onDateRangeSelected")({
            start,
            end,
          });

          setStartDate(start);
          setEndDate(end);
        }}
      />
    </div>
  );
};

DateRangePickerStory.story = {
  name: "Date Range Picker",
};

export const DateRangePickerPopoverStory = () => {
  const classes = useStyles();

  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();

  return (
    <div className={classes.container} style={{ maxWidth: "700px" }}>
      <DateRangePickerPopover
        startDate={startDate}
        endDate={endDate}
        placeholder="Select dates"
        onDateRangeSelected={(start, end) => {
          action("onDateRangeSelected")({
            start,
            end,
          });

          setStartDate(start);
          setEndDate(end);
        }}
      />
    </div>
  );
};

DateRangePickerPopoverStory.story = {
  name: "Date Range Picker Popover",
};

export const DatePickerStory = () => {
  const classes = useStyles();
  const [startDate, setStartDate] = React.useState<Date | string>(new Date());
  const [endDate, setEndDate] = React.useState<Date | string | undefined>();

  return (
    <div className={classes.container}>
      <DatePicker
        variant="single"
        startDate={startDate}
        endDate={endDate}
        onChange={({ startDate, endDate }) => {
          action("onChange")({
            startDate,
            endDate,
          });

          setStartDate(startDate);
          setEndDate(endDate);
        }}
        startLabel="From"
        endLabel="To"
        dateFormat={text("dateFormat", DEFAULT_DATE_FORMAT)}
      />
    </div>
  );
};

DatePickerStory.story = {
  name: "Single Date Picker",
};

export const SingleHiddenDateStory = () => {
  const classes = useStyles();
  const [startDate, setStartDate] = React.useState<Date | string>(new Date());
  const [endDate, setEndDate] = React.useState<Date | string | undefined>();

  return (
    <div className={classes.container}>
      <DatePicker
        variant="single-hidden"
        startDate={startDate}
        endDate={endDate}
        onChange={({ startDate, endDate }) => {
          action("onChange")({
            startDate,
            endDate,
          });

          setStartDate(startDate);
          setEndDate(endDate);
        }}
        dateFormat={text("dateFormat", DEFAULT_DATE_FORMAT)}
      />
    </div>
  );
};

SingleHiddenDateStory.story = {
  name: "Single Date Picker Show Calendar on Focus",
};

export const CalendarStory = () => {
  const classes = useStyles();
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    new Date()
  );

  return (
    <div className={classes.container}>
      <Calendar
        startDate={startDate}
        onMonthChange={date => setStartDate(date)}
        onChange={date => setStartDate(date)}
        disableDays={boolean("disableDays", false)}
        disablePast={boolean("disablePast", false)}
        disableFuture={boolean("disableFuture", false)}
      />
    </div>
  );
};

CalendarStory.story = {
  name: "Calendar",
};

export const CustomCalendarStory = () => {
  const classes = useStyles();
  const {
    selectedDates,
    toggleSelectedDates,
    setSelectedDates,
  } = useToggleDatesList([]);

  const customDates = [...selectedDates].map((date: number) => ({
    date: new Date(date),
    buttonProps: { className: classes.activeDay },
  }));

  const [month, setMonth] = React.useState(new Date());

  return (
    <div className={classes.container}>
      <CustomCalendar
        onSelectDates={(dates: Array<Date>) => {
          if (dates.length > 1) {
            // Selecting a date range
            setSelectedDates(dates);
          } else {
            // Selecting a single date
            toggleSelectedDates(dates);
          }

          action("onSelectDates")({ dates });
        }}
        month={month}
        customDates={customDates}
        previousMonthNavigation={boolean("previousMonthNavigation", true)}
        nextMonthNavigation={boolean("nextMonthNavigation", true)}
        variant={select("variant", { Month: "month", Weeks: "weeks" }, "month")}
        onMonthChange={month => {
          setMonth(month);
          action("onMonthChange")({ month });
        }}
      />
    </div>
  );
};

CustomCalendarStory.story = {
  name: "Custom Calendar",
};

export const SingleMonthCalendarStory = () => {
  const classes = useStyles();
  const today = new Date();

  return (
    <div className={classes.container}>
      <SingleMonthCalendar
        currentMonth={customDate("startDate", today)}
        onSelectDate={date => alert(`Selected date: ${date}`)}
        customDates={[
          {
            date: today,
            buttonProps: {
              className: classes.activeDay,
              onClick() {
                alert("Clicked");
              },
            },
          },
          {
            date: addDays(today, 1),
            buttonProps: {
              className: classes.activeDay,
            },
          },
          {
            date: addDays(today, 3),
            buttonProps: {
              className: classes.customDay,
            },
          },
          {
            date: addDays(today, 13),
            buttonProps: {
              className: classes.customDay,
            },
          },
        ]}
      />
    </div>
  );
};

SingleMonthCalendarStory.story = {
  name: "Single Month Calendar",
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    maxWidth: theme.typography.pxToRem(480),
    width: "100%",
  },
  activeDay: {
    backgroundColor: "#2196F3",
    color: "white",

    "&:hover": {
      backgroundColor: "#2196F3",
      color: "white",
    },
  },
  customDay: {
    backgroundColor: "red",
    color: "white",
    cursor: "default",

    "&:hover": {
      backgroundColor: "red",
      color: "white",
    },
  },
}));

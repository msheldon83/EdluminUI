import * as React from "react";
import { action } from "@storybook/addon-actions";
import { text, boolean, date } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import endOfTomorrow from "date-fns/endOfTomorrow";
import endOfYesterday from "date-fns/endOfYesterday";
import addDays from "date-fns/addDays";
import { DatePicker, DEFAULT_DATE_FORMAT } from "./date-picker";
import { Calendar } from "./calendar";
import { FiveWeekCalendar } from "./five-week-calendar";
import { SingleMonthCalendar } from "./single-month-calendar";
import { CustomCalendar, useToggleDatesList } from "./custom-calendar";

export default {
  title: "Forms/Date Picker",
};

export const DateRangePickerStory = () => {
  const classes = useStyles();
  const [startDate, setStartDate] = React.useState<Date | string>(new Date());
  const [endDate, setEndDate] = React.useState<Date | string | undefined>();

  return (
    <div className={classes.container}>
      <DatePicker
        variant="range"
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
        disableDates={[endOfTomorrow(), endOfYesterday()]}
      />
    </div>
  );
};

DateRangePickerStory.story = {
  name: "Date Range",
};

export const DatePickerExtendedRangeStory = () => {
  return <h1>Coming Soon.</h1>;
  // const classes = useStyles();
  // const [startDate, setStartDate] = React.useState<Date | string>(new Date());
  // const [endDate, setEndDate] = React.useState<Date | string | undefined>();

  // return (
  //   <div className={classes.container}>
  //     <DatePicker
  //       variant="extended-range"
  //       startDate={startDate}
  //       endDate={endDate}
  //       onChange={({ startDate, endDate }) => {
  //         action("onChange")({
  //           startDate,
  //           endDate,
  //         });

  //         setStartDate(startDate);
  //         setEndDate(endDate);
  //       }}
  //       startLabel="From"
  //       endLabel="To"
  //       dateFormat={text("dateFormat", DEFAULT_DATE_FORMAT)}
  //       disableDates={[endOfTomorrow(), endOfYesterday()]}
  //     />
  //   </div>
  // );
};

DatePickerExtendedRangeStory.story = {
  name: "Date Range Extended",
};

export const SingleDateStory = () => {
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
        startLabel="Date"
        dateFormat={text("dateFormat", DEFAULT_DATE_FORMAT)}
        disableDates={[endOfTomorrow(), endOfYesterday()]}
      />
    </div>
  );
};

SingleDateStory.story = {
  name: "Single Date",
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
        startLabel="Date"
        dateFormat={text("dateFormat", DEFAULT_DATE_FORMAT)}
        disableDates={[endOfTomorrow(), endOfYesterday()]}
      />
    </div>
  );
};

SingleHiddenDateStory.story = {
  name: "Show Calendar on Focus",
};

const customDate = (name: string, defaultValue?: Date): Date => {
  const value = date(name, defaultValue);

  const d = new Date(value);
  return new Date(d);
};

export const CalendarStory = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Calendar
        startDate={customDate("startDate", new Date())}
        endDate={customDate("endDateDate")}
        range={boolean("range", false)}
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

export const FiveWeekCalendarStory = () => {
  const classes = useStyles();
  const today = new Date();

  return (
    <div className={classes.container}>
      <FiveWeekCalendar
        disableWeekends={boolean("disableWeekends", true)}
        startDate={customDate("startDate", new Date())}
        selectedDates={[today, addDays(today, 1), addDays(today, 2)]}
      />
    </div>
  );
};

FiveWeekCalendarStory.story = {
  name: "Five Week Calendar",
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
        month={customDate("month", new Date())}
        customDates={customDates}
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

import * as React from "react";
import { action } from "@storybook/addon-actions";
import { text } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import endOfTomorrow from "date-fns/endOfTomorrow";
import endOfYesterday from "date-fns/endOfYesterday";
import { DatePicker, DEFAULT_DATE_FORMAT } from "./date-picker";

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

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    maxWidth: theme.typography.pxToRem(366),
    width: "100%",
  },
}));

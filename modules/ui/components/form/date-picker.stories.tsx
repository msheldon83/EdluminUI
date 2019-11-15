import * as React from "react";
import { action } from "@storybook/addon-actions";
import { text, boolean, object, date } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import endOfTomorrow from "date-fns/endOfTomorrow";
import endOfYesterday from "date-fns/endOfYesterday";

import {
  DatePicker as DatePickerComponent,
  DEFAULT_DATE_FORMAT,
} from "./date-picker";

export const DatePicker = () => {
  const classes = useStyles();
  const [startDate, setStartDate] = React.useState<Date | string>(new Date());
  const [endDate, setEndDate] = React.useState<Date | string | undefined>();

  return (
    <div className={classes.container}>
      <DatePickerComponent
        showCalendarOnFocus={boolean("showCalendarOnFocus", false)}
        singleDate={boolean("singleDate", false)}
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

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    maxWidth: theme.typography.pxToRem(366),
    width: "100%",
  },
}));

import * as React from "react";
import { action } from "@storybook/addon-actions";
import { text, boolean, object, date } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import { DatePicker as DatePickerComponent } from "./date-picker";

export const DatePicker = () => {
  const classes = useStyles();
  const [startDate, setStartDate] = React.useState<Date | string>(new Date());
  const [endDate, setEndDate] = React.useState<Date | string | undefined>();

  return (
    <div className={classes.container}>
      <DatePickerComponent
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

import * as React from "react";
import { action } from "@storybook/addon-actions";
import { text, boolean, object, date } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import { TimeInput as TimeInputComponent } from "./time-input";
import { timeStampToIso } from "../../../helpers/time";

export const TimeInput = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState();

  return (
    <div className={classes.container}>
      <TimeInputComponent
        label={text("Label", "Start Time")}
        onValidTime={time => {
          action("onValidTime")(time);
          setValue(time);
        }}
        onChange={value => {
          action("onChange")(value);
          setValue(value);
        }}
        value={value}
        earliestTime="2019-11-04T13:00:00.000Z" /* 8am */
        // earliestTime="2019-11-04T19:00:00.000Z" /* 2pm */
      />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    maxWidth: theme.typography.pxToRem(170),
    width: "100%",
  },
}));

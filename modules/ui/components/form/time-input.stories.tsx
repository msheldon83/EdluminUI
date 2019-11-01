import * as React from "react";
import { action } from "@storybook/addon-actions";
import { text, boolean, object } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import { TimeInput as TimeInputComponent } from "./time-input";

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

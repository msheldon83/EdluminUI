import * as React from "react";
import { action } from "@storybook/addon-actions";
import { text, boolean, object } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import { TimeInput as TimeInputComponent } from ".";

export const TimeInput = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <TimeInputComponent label={text("Label", "Start Time")} />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    maxWidth: theme.typography.pxToRem(400),
    width: "100%",
  },
}));

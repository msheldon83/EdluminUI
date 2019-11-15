import * as React from "react";
import { action } from "@storybook/addon-actions";
import { text, boolean, object, date } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import { Input } from "./input";

export const InputStory = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Input label="Custom Input" />
    </div>
  );
};

InputStory.story = {
  name: "Input",
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    maxWidth: theme.typography.pxToRem(170),
    width: "100%",
  },
}));

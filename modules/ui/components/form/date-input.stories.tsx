import * as React from "react";
import { text } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import { DateInput } from "./date-input";

export const DateInputStory = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState<Date | string>();

  return (
    <div className={classes.container}>
      <DateInput
        label={text("label", "Date Input")}
        value={value}
        onChange={(date: string) => setValue(date)}
        onValidDate={date => setValue(date)}
      />
    </div>
  );
};

DateInputStory.story = {
  name: "Date Input",
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    maxWidth: theme.typography.pxToRem(270),
    width: "100%",
  },
}));

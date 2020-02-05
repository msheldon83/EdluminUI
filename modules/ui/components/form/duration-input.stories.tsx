import * as React from "react";
import { action } from "@storybook/addon-actions";
import { text, select } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import { DurationInput as DurationInputComponent } from "./duration-input";

export const DurationInput = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState();

  return (
    <div className={classes.container}>
      <DurationInputComponent
        label={text("Label", "Duration Input")}
        onChange={(value: number) => {
          action("onChange")(value);
          setValue(value);
        }}
        value={value}
        helperMessage={text(
          "helperMessage",
          "The shortest time (in minutes) that an employee with this position can be absent"
        )}
      />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    maxWidth: theme.typography.pxToRem(470),
    width: "100%",
  },
}));

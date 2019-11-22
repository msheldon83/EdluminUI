import * as React from "react";
import { action } from "@storybook/addon-actions";
import { text, boolean, object, select } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import { Select as CustomSelect, SelectValueType } from "./select";

const options = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
  { value: "three", label: "Three" },
  { value: "four", label: "Four" },
  { value: "five", label: "Five" },
];

export const Select = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState<SelectValueType>();

  return (
    <div>
      <div className={classes.container}>
        <CustomSelect
          label={text("Label", "Basic Select")}
          value={value}
          onChange={value => {
            action("Set Value")(value);
            setValue(value);
          }}
          options={object("Options", options)}
          multi={boolean("Multiple", false)}
          native={boolean("Native", false)}
          disabled={boolean("Disabled", false)}
          inputStatus={select(
            "InputStatus",
            { undefined: null, error: "error" },
            null
          )}
          validationMessage={text("ValidationMessage", "")}
        />
      </div>
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

import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import { Select, SelectValueType } from "./select";

export default {
  title: "Forms/Select",
};

const options = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
  { value: "three", label: "Three" },
  { value: "four", label: "Four" },
  { value: "five", label: "Five" },
];

export const BasicSelect = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState<SelectValueType>();

  return (
    <div>
      <div className={classes.container}>
        <Select
          label="Basic Select"
          value={value}
          onChange={setValue}
          options={options}
        />
      </div>
    </div>
  );
};

export const MultiSelect = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState<SelectValueType>();

  return (
    <div className={classes.container}>
      <Select
        label="Multi Select"
        value={value}
        onChange={setValue}
        options={options}
        multi
      />
    </div>
  );
};

export const NativeSelect = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState<SelectValueType>();

  return (
    <div className={classes.container}>
      <Select
        label="Native Select"
        value={value}
        onChange={setValue}
        options={options}
        native
      />
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

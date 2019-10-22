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

  const handleChange = (value: SelectValueType) => {
    setValue(value);
  };

  return (
    <div className={classes.container}>
      <Select
        label="Basic Select"
        placeholder="Choose one"
        value={value}
        onChange={handleChange}
        options={options}
      />
    </div>
  );
};

export const MultiSelect = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState<SelectValueType>();

  const handleChange = (value: SelectValueType) => {
    setValue(value);
  };

  return (
    <div className={classes.container}>
      <Select
        label="Multi Select"
        placeholder="Choose some"
        value={value}
        onChange={handleChange}
        options={options}
        multi
      />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    margin: theme.spacing(2),
    width: 400,
  },
}));

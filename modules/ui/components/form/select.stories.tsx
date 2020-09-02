import * as React from "react";
import { action } from "@storybook/addon-actions";
import { text, boolean, object, select } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import { Select as CustomSelect, OptionType } from "./select";

const options = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
  { value: "three", label: "Three" },
  { value: "four", label: "Four" },
  { value: "five", label: "Five" },
];

export const Select = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState<OptionType | undefined>({
    label: "Initial Value",
    value: "initial-value",
  });

  const options = [
    { label: "One", value: 1 },
    { label: "Two", value: 2 },
    { label: "Three", value: 3 },
    { label: "Four", value: 4 },
    { label: "Five", value: 5 },
    { label: "Six", value: 6 },
    { label: "Seven", value: 7 },
    { label: "Eight", value: 8 },
    { label: "Nine", value: 9 },
    { label: "Ten", value: 10 },
  ];

  return (
    <div className={classes.container}>
      <CustomSelect
        label={text("label", "Select Label")}
        value={value}
        multiple={false}
        options={object("options", options)}
        onChange={(value: OptionType) => {
          action("onChange")(value);
          setValue(value);
        }}
        validationMessage={text("validationMessage", "")}
        inputStatus={select(
          "inputStatus",
          { undefined: null, error: "error" },
          null
        )}
        disabled={boolean("disabled", false)}
      />
    </div>
  );
};

export const MultiSelect = () => {
  const classes = useStyles();
  const [value1, setValue1] = React.useState<Array<OptionType>>([]);
  const [value2, setValue2] = React.useState<Array<OptionType>>([]);

  const options = [
    { label: "One", value: 1 },
    { label: "Two", value: 2 },
    { label: "Three", value: 3 },
    { label: "Four", value: 4 },
    { label: "Five", value: 5 },
    { label: "Six", value: 6 },
    { label: "Seven", value: 7 },
    { label: "Eight", value: 8 },
    { label: "Nine", value: 9 },
    { label: "Ten", value: 10 },
  ];

  return (
    <div className={`${classes.container} ${classes.flexContainer}`}>
      <CustomSelect
        className={classes.flexItem}
        label={text("label", "Multi Select Label")}
        value={value1}
        multiple
        options={object("options", options)}
        onChange={(value: Array<OptionType>) => {
          action("onChange")(value);
          setValue1(value);
        }}
        validationMessage={text("validationMessage", "")}
        inputStatus={select(
          "inputStatus",
          { undefined: null, error: "error" },
          null
        )}
        disabled={boolean("disabled", false)}
      />
      <CustomSelect
        className={classes.flexItem}
        label={text("label", "Multi Select Label")}
        value={value2}
        multiple
        options={object("options", options)}
        onChange={(value: Array<OptionType>) => {
          action("onChange")(value);
          setValue2(value);
        }}
        validationMessage={text("validationMessage", "")}
        inputStatus={select(
          "inputStatus",
          { undefined: null, error: "error" },
          null
        )}
        disabled={boolean("disabled", false)}
      />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    background: "#fff",
    padding: theme.spacing(2),
    maxWidth: theme.typography.pxToRem(400),
    width: "100%",
  },
  flexContainer: {
    alignItems: "flex-start",
    display: "flex",
    maxWidth: theme.typography.pxToRem(700),
  },
  flexItem: {
    flex: 1,
    marginRight: theme.spacing(2),
  },
}));

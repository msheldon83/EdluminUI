import * as React from "react";
import { action } from "@storybook/addon-actions";
import { text, number, object, date, select } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import { PhoneInput } from "./phone-input";

export const PhoneInputStory = () => {
  const classes = useStyles();

  const [value, setValue] = React.useState();

  return (
    <div className={classes.container}>
      <PhoneInput
        label={text("label", "Phone Input")}
        value={value}
        inputStatus={select(
          "InputStatus",
          { undefined: null, error: "error" },
          null
        )}
        validationMessage={text("ValidationMessage", "")}
        onChange={e => setValue(e.target.value)}
        onValidPhoneNumber={phoneNumber => {
          action("onValidPhoneNumber")(phoneNumber);
          setValue(phoneNumber);
        }}
      />
    </div>
  );
};

PhoneInputStory.story = {
  name: "Phone Input",
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    maxWidth: theme.typography.pxToRem(270),
    width: "100%",
  },
}));

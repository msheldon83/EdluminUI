import * as React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import PhoneInput from "react-phone-input-2";

type Props = {
  phoneNumber: string;
  forViewOnly: boolean;
};

//export Phone Number Component with minimal props
export const PhoneNumberInput: React.FunctionComponent<Props> = props => {
  const classes = useStyles();

  return (
    <PhoneInput
      country="us"
      regions={["north-america"]}
      //inputStyle={[classes.inputStyle]}
      disabled={props.forViewOnly}
      value={props.phoneNumber}
      {...props}
    />
  );
};

const useStyles = makeStyles(theme => ({
  inputStyle: {
    justifyContent: "center",
    borderStyle: "none",
    backgroundColor: "none",
  },
  font: {
    fontFamily: "Roboto",
    fontSize: theme.typography.pxToRem(12),
  },
}));

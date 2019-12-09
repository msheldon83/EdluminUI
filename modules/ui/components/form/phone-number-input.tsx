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
  const inputStyle = props.forViewOnly ? classes.viewStyle : classes.editStyle;

  return (
    <PhoneInput
      country={"us"}
      disableDropdown={true}
      regions={"north-america"}
      inputClass={inputStyle}
      disabled={props.forViewOnly}
      value={props.phoneNumber}
      {...props}
    />
  );
};

const useStyles = makeStyles(theme => ({
  viewStyle: {
    justifyContent: "center",
    backgroundColor: "white",
    border: "none",
    fontFamily: "Roboto",
    fontSize: "14px",
    color: "black",
    width: "50%",
  },
  editStyle: {
    justifyContent: "center",
    padding: "7px",
    fontFamily: "Roboto",
    fontSize: "14px",
    color: "black",
    borderRadius: "4px",
    width: "50%",
  },
  input: {
    justifyContent: "center",
    fontFamily: "Roboto",
  },
}));

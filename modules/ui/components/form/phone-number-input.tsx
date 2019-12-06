import * as React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import PhoneInput from "react-phone-input-2";

type Props = {
  phoneNumber?: string;
  forEdit: boolean;
};

//export Phone Number Component with minimal props
export const PhoneNumberInput: React.FunctionComponent<Props> = props => {
  const classes = useStyles();

  return (
    <PhoneInput
      className={classes.alignCenter}
      forEdit
      phoneNumber
      {...props}
    />
  );
};

const useStyles = makeStyles(theme => ({
  alignCenter: {
    justifyContent: "center",
  },
}));

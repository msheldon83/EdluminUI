import * as React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import PhoneInput from "react-phone-input-2";
import Grid from "@material-ui/core/Grid";

type Props = {
  phoneNumber: string;
  forViewOnly: boolean;
};

//export Phone Number Component with minimal props
export const PhoneNumberInput: React.FunctionComponent<Props> = props => {
  const classes = useStyles();
  const inputStyle = props.forViewOnly ? classes.viewStyle : classes.editStyle;

  return (
    <Grid item xs={12} sm={6} lg={6}>
      <dt className={classes.title}>Phone</dt>
      <dd className={classes.description}>
        <PhoneInput
          country={"us"}
          disableDropdown={true}
          regions={"north-america"}
          inputClass={inputStyle}
          disabled={props.forViewOnly}
          value={props.phoneNumber}
          {...props}
        />
      </dd>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  viewStyle: {
    justifyContent: "center",
    backgroundColor: "white",
    border: "none",
    fontFamily: theme.typography.fontFamily,
    fontSize: "14px",
    color: "black",
    width: "50%",
  },
  editStyle: {
    justifyContent: "center",
    padding: "7px",
    fontFamily: theme.typography.fontFamily,
    fontSize: "14px",
    color: "black",
    borderRadius: "4px",
    width: "50%",
  },
  description: {
    fontSize: theme.typography.pxToRem(14),
    lineHeight: theme.typography.pxToRem(21),
    margin: 0,
  },
  title: {
    fontSize: theme.typography.pxToRem(16),
    fontWeight: "bold",
    lineHeight: theme.typography.pxToRem(24),
  },
}));

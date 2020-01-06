import * as React from "react";
import { makeStyles, Button } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";

type Props = ButtonProps;

export const TextButton: React.FC<Props> = props => {
  const disableRipple =
    props.disableRipple === undefined ? true : props.disableRipple;
  const classes = useStyles();
  return (
    <Button
      {...props}
      disableRipple={disableRipple}
      className={`${classes.button} ${props.className}`}
    >
      {props.children}
    </Button>
  );
};

const useStyles = makeStyles(theme => ({
  button: {
    color: theme.customColors.blue,
    padding: 0,
    fontWeight: "normal",
    textDecoration: "underline",
    fontSize: theme.typography.pxToRem(14),
    letterSpacing: theme.typography.pxToRem(0.5),

    "&:hover": {
      backgroundColor: "inherit",
      textDecoration: "underline",
    },
  },
}));

import * as React from "react";
import { makeStyles, Button } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";

type Props = ButtonProps;

export const TextButton: React.FC<Props> = props => {
  const classes = useStyles();
  return (
    <Button {...props} className={classes.button}>
      {props.children}
    </Button>
  );
};

const useStyles = makeStyles(theme => ({
  button: {
    color: theme.customColors.blue,
    textTransform: "uppercase",
    "&:hover": {
      backgroundColor: "inherit",
    },
  },
}));

import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSnackbar, SnackbarProvider } from "./use-snackbar";
import Snackbar from "@material-ui/core/Snackbar";
import Button from "@material-ui/core/Button";

export default {
  title: "Hooks/Snackbar",
};

/*
  NOTE: the buttons that open the snackbar need to be inside the provider in order
  to properly get the context, so they are defined as separate components.
*/

const InfoSnackbarButton = () => {
  const { openSnackbar } = useSnackbar();

  return (
    <Button
      onClick={() =>
        openSnackbar({
          message: "Info Snackbar",
          dismissable: true,
        })
      }
    >
      Open Info Snackbar
    </Button>
  );
};

export const Info = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <SnackbarProvider>
        <InfoSnackbarButton />
      </SnackbarProvider>
    </div>
  );
};

const SuccessSnackbarButton = () => {
  const { openSnackbar, closeSnackbar } = useSnackbar();

  return (
    <Button
      onClick={() =>
        openSnackbar({
          message: "Success Snackbar",
          dismissable: true,
          status: "success",
          autoHideDuration: null,
        })
      }
    >
      Open Success Snackbar
    </Button>
  );
};

export const Success = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <SnackbarProvider>
        <SuccessSnackbarButton />
      </SnackbarProvider>
    </div>
  );
};

const WarningSnackbarButton = () => {
  const { openSnackbar, closeSnackbar } = useSnackbar();

  return (
    <Button
      onClick={() =>
        openSnackbar({
          message: "Warning Snackbar",
          dismissable: true,
          status: "warning",
          autoHideDuration: null,
        })
      }
    >
      Open Warning Snackbar
    </Button>
  );
};

export const Warning = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <SnackbarProvider>
        <WarningSnackbarButton />
      </SnackbarProvider>
    </div>
  );
};

const ErrorSnackbarButton = () => {
  const { openSnackbar, closeSnackbar } = useSnackbar();

  return (
    <Button
      onClick={() =>
        openSnackbar({
          message: "Error Snackbar",
          dismissable: true,
          status: "error",
          autoHideDuration: null,
        })
      }
    >
      Open Error Snackbar
    </Button>
  );
};

export const Error = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <SnackbarProvider>
        <ErrorSnackbarButton />
      </SnackbarProvider>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    margin: theme.spacing(2),
  },
}));

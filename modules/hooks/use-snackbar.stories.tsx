import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSnackbar, SnackbarProvider } from "./use-snackbar";
import Snackbar from "@material-ui/core/Snackbar";
import Button from "@material-ui/core/Button";

export default {
  title: "Hooks/Snackbar",
};

const DefaultSnackbarButton = () => {
  const { openSnackbar } = useSnackbar();

  const snackbarConfiguration = {
    message: "Default Snackbar",
  };

  return (
    <Button
      variant="contained"
      onClick={() => openSnackbar(snackbarConfiguration)}
    >
      Open Default Snackbar
    </Button>
  );
};

export const DefaultSnackbar = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <SnackbarProvider>
        <DefaultSnackbarButton />
      </SnackbarProvider>
    </div>
  );
};

const ConfiguredSnackbarButton = () => {
  const { openSnackbar. closeSnackbar } = useSnackbar();

  const snackbarConfiguration = {
    message: "Configured Snackbar",
    action: (
      <Button color="inherit" size="small" onClick={() => closeSnackbar()}>
        Close
      </Button>
    )
  };

  return (
    <Button
      variant="contained"
      onClick={() => openSnackbar(snackbarConfiguration)}
    >
      Open Configured Snackbar
    </Button>
  );
};

export const ConfiguredSnackbar = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <SnackbarProvider>
        <ConfiguredSnackbarButton />
      </SnackbarProvider>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    margin: theme.spacing(2),
  },
}));

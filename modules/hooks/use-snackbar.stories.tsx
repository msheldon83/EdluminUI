import * as React from "react";
import { select, text, boolean } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import { useSnackbar, SnackbarProvider } from "./use-snackbar";
import Button from "@material-ui/core/Button";

/*
  NOTE: the buttons that open the snackbar need to be inside the provider in order
  to properly get the context, so they are defined as separate components.
*/

const InfoSnackbarButton = () => {
  const { openSnackbar } = useSnackbar();

  return (
    <Button
      variant="contained"
      onClick={() =>
        openSnackbar({
          message: text("message", "Info Snackbar"),
          dismissable: boolean("dismissable", true),
          status: select(
            "status",
            ["info", "success", "warning", "error"],
            "info"
          ),
        })
      }
    >
      Open Snackbar
    </Button>
  );
};

export const Snackbar = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <SnackbarProvider>
        <InfoSnackbarButton />
      </SnackbarProvider>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    margin: theme.spacing(2),
  },
}));

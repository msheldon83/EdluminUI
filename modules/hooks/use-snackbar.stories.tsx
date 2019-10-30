import * as React from "react";
import { select, text, boolean } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import { useSnackbar, SnackbarProvider } from "./use-snackbar";
import Button from "@material-ui/core/Button";

export default {
  title: "Hooks",
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
      Open Info Snackbar
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

// const SuccessSnackbarButton = () => {
//   const { openSnackbar, closeSnackbar } = useSnackbar();

//   return (
//     <Button
//       onClick={() =>
//         openSnackbar({
//           message: "Success Snackbar",
//           dismissable: true,
//           status: "success",
//           autoHideDuration: null,
//         })
//       }
//     >
//       Open Success Snackbar
//     </Button>
//   );
// };

// export const Success = () => {
//   const classes = useStyles();

//   return (
//     <div className={classes.container}>
//       <SnackbarProvider>
//         <SuccessSnackbarButton />
//       </SnackbarProvider>
//     </div>
//   );
// };

// const WarningSnackbarButton = () => {
//   const { openSnackbar, closeSnackbar } = useSnackbar();

//   return (
//     <Button
//       onClick={() =>
//         openSnackbar({
//           message: "Warning Snackbar",
//           dismissable: true,
//           status: "warning",
//           autoHideDuration: null,
//         })
//       }
//     >
//       Open Warning Snackbar
//     </Button>
//   );
// };

// export const Warning = () => {
//   const classes = useStyles();

//   return (
//     <div className={classes.container}>
//       <SnackbarProvider>
//         <WarningSnackbarButton />
//       </SnackbarProvider>
//     </div>
//   );
// };

// const ErrorSnackbarButton = () => {
//   const { openSnackbar, closeSnackbar } = useSnackbar();

//   return (
//     <Button
//       onClick={() =>
//         openSnackbar({
//           message: "Error Snackbar",
//           dismissable: true,
//           status: "error",
//           autoHideDuration: null,
//         })
//       }
//     >
//       Open Error Snackbar
//     </Button>
//   );
// };

// export const Error = () => {
//   const classes = useStyles();

//   return (
//     <div className={classes.container}>
//       <SnackbarProvider>
//         <ErrorSnackbarButton />
//       </SnackbarProvider>
//     </div>
//   );
// };

const useStyles = makeStyles(theme => ({
  container: {
    margin: theme.spacing(2),
  },
}));

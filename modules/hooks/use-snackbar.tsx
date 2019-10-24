import * as React from "react";
import MuiSnackbar, {
  SnackbarProps,
  SnackbarOrigin,
} from "@material-ui/core/Snackbar";

type Props = {
  children: React.ReactNode;
  snackbarProps?: SnackbarProps;
};

export const SnackbarProvider = (props: Props) => {
  const defaultSnackbarProps: SnackbarProps = {
    open: false,
    anchorOrigin: {
      vertical: "top",
      horizontal: "right",
    },
    autoHideDuration: 6000,
    onClose: closeSnackbar,
  };

  const [snackbarConfiguration, setSnackbar] = React.useState<SnackbarProps>(
    defaultSnackbarProps
  );

  function openSnackbar(newSnackbarConfiguration: Omit<SnackbarProps, "open">) {
    setSnackbar({
      ...newSnackbarConfiguration,
      open: true,
    });
  }

  function closeSnackbar() {
    setSnackbar({
      open: false,
    });
  }

  // Cascading defautls
  const snackbarProps: SnackbarProps = {
    ...defaultSnackbarProps,
    ...props.snackbarProps,
    ...snackbarConfiguration,
  };

  const providerValue = {
    openSnackbar,
    closeSnackbar,
  };

  return (
    <Context.Provider value={providerValue}>
      {props.children}

      {/* This provider will allow the Snackbar to exists across routes and renders */}
      <MuiSnackbar {...snackbarProps} />
    </Context.Provider>
  );
};

type ContextValue = {
  openSnackbar: (snackbarProps: Omit<SnackbarProps, "open">) => void;
  closeSnackbar: () => void;
};

// Defaults to make the compiler happy
const Context = React.createContext<ContextValue>({
  openSnackbar() {},
  closeSnackbar() {},
});

export const useSnackbar = () => {
  return React.useContext(Context);
};

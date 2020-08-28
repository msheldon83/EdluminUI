import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import MuiSnackbar, { SnackbarProps } from "@material-ui/core/Snackbar";
import SnackbarContent, {
  SnackbarContentProps,
} from "@material-ui/core/SnackbarContent";
import Fade from "@material-ui/core/Fade";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import WarningIcon from "@material-ui/icons/Warning";
import { useIsMobile } from "hooks";

export type SnackbarHookType = {
  status?: StatusType;
  dismissable?: boolean;
  message: React.ReactNode;
  autoHideDuration?: number | null;
};

type SnackbarProviderProps = {
  children: React.ReactNode;
  snackbarProps?: SnackbarProps;
};

type SnackbarPropsState = Omit<SnackbarProps, "open">;

type StatusType = "success" | "warning" | "error" | "info";

type ContextValue = {
  openSnackbar: (snackbarConfig: SnackbarHookType) => void;
  closeSnackbar: () => void;
};

export const SnackbarProvider = (props: SnackbarProviderProps) => {
  const classes = useStyles();
  const isMobile = useIsMobile();

  const defaultSnackbarProps: SnackbarPropsState = {
    anchorOrigin: {
      vertical: "top",
      horizontal: "right",
    },
    autoHideDuration: null,
    onClose: closeSnackbar,
    TransitionComponent: Fade,

    // Don't auto hide the snackbar if there's a click outside of it
    ClickAwayListenerProps: {
      mouseEvent: false,
    },
  };

  const [isSnackbarOpen, setIsSnackbarOpen] = React.useState(false);
  const [snackbarProps, setSnackbarProps] = React.useState<SnackbarPropsState>(
    defaultSnackbarProps
  );
  const [snackbarContentProps, setSnackbarContentProps] = React.useState<
    SnackbarContentProps
  >({});

  const openSnackbar = (snackbarConfig: SnackbarHookType) => {
    // // The status defaults to "info"
    const status: StatusType = snackbarConfig.status
      ? snackbarConfig.status
      : "info";

    // Each status will use a different icon
    const Icon = statusIcon[status];

    const message = (
      <span className={classes.message}>
        <Icon className={classes.icon} />
        {snackbarConfig.message}
      </span>
    );

    const action = snackbarConfig.dismissable ? (
      <DismissableAction onClose={closeSnackbar} />
    ) : (
      undefined
    );

    setSnackbarProps({
      classes: {
        root: classes[status],
      },
      autoHideDuration: snackbarConfig.autoHideDuration,
    });

    setSnackbarContentProps({ action, className: classes[status], message });

    setIsSnackbarOpen(true);
  };

  function closeSnackbar() {
    setIsSnackbarOpen(false);
  }

  return (
    <Context.Provider
      value={{
        openSnackbar,
        closeSnackbar,
      }}
    >
      {props.children}

      {/* This provider will allow the Snackbar to exists across routes and renders */}
      <MuiSnackbar
        className={isMobile ? classes.mobileSnackbar : classes.snackbar}
        {...defaultSnackbarProps}
        {...props.snackbarProps}
        {...snackbarProps}
        open={isSnackbarOpen}
      >
        <SnackbarContent
          aria-describedby="client-snackbar"
          {...snackbarContentProps}
        />
      </MuiSnackbar>
    </Context.Provider>
  );
};

const DismissableAction = ({ onClose }: { onClose: () => void }) => {
  const classes = useStyles();

  return (
    <IconButton
      key="close"
      aria-label="close"
      color="inherit"
      onClick={onClose}
    >
      <CloseIcon className={classes.dismissableIcon} />
    </IconButton>
  );
};

const statusIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

// Defaults to make the compiler happy
const Context = React.createContext<ContextValue>({
  openSnackbar() {
    return undefined;
  },
  closeSnackbar() {
    return undefined;
  },
});

export const useSnackbar = () => {
  return React.useContext(Context);
};

const useStyles = makeStyles(theme => ({
  dismissableIcon: {
    fontSize: theme.typography.pxToRem(20),
  },
  message: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    fontSize: theme.typography.pxToRem(20),
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  success: {
    backgroundColor: theme.customColors.success,
  },
  error: {
    backgroundColor: theme.palette.error.main,
  },
  info: {
    backgroundColor: theme.customColors.info,
  },
  warning: {
    backgroundColor: theme.customColors.warning,
  },
  snackbar: {
    top: theme.spacing(10),
    right: theme.spacing(6),
    borderRadius: theme.typography.pxToRem(4),
  },
  mobileSnackbar: {
    top: theme.spacing(10),
    right: theme.spacing(3),
    borderRadius: theme.typography.pxToRem(4),
  },
}));

import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import DialogContainer from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

export type OpenDialogOptions = {
  title?: string;
  renderContent: (action: RenderFunctionsType) => React.ReactNode;
  renderActions?: (actions: RenderFunctionsType) => React.ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscapeKey?: boolean;
  fullWidth?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl"; // from the Material-UI Dialog's props
  onClose?: (reason: CloseReason) => void;
};

export type CloseReason = "escapeKeyDown" | "backdropClick";

export type DialogProviderProps = {
  children: React.ReactNode;
};

type ContextValue = {
  openDialog: (options: OpenDialogOptions) => void;
  closeDialog: () => void;
};

export type RenderFunctionsType = {
  closeDialog: () => void;
};

// Defaults to make the compiler happy
const DialogContext = React.createContext<ContextValue>({
  openDialog() {
    return undefined;
  },
  closeDialog() {
    return undefined;
  },
});

export const DialogProvider = (props: DialogProviderProps) => {
  const { children } = props;

  const classes = useStyles();

  const defaultDialogOptions = {
    renderContent: () => null,
    closeOnBackdropClick: true,
    closeOnEscapeKey: true,
  };

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogOptions, setDialogOptions] = React.useState<OpenDialogOptions>(
    defaultDialogOptions
  );

  const openDialog = (options: OpenDialogOptions) => {
    setDialogOpen(true);

    setDialogOptions({
      ...defaultDialogOptions,
      ...options,
    });
  };

  const closeDialog = () => setDialogOpen(false);

  const handleDialogClose = (event: object, reason: CloseReason) =>
    typeof dialogOptions.onClose === "function" &&
    dialogOptions.onClose(reason);

  const renderFunctionArgs: RenderFunctionsType = {
    closeDialog,
  };

  return (
    <DialogContext.Provider
      value={{
        openDialog,
        closeDialog,
      }}
    >
      <DialogContainer
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={dialogOptions.fullWidth}
        maxWidth={dialogOptions.maxWidth}
        disableBackdropClick={!dialogOptions.closeOnBackdropClick}
        disableEscapeKeyDown={!dialogOptions.closeOnEscapeKey}
        onBackdropClick={closeDialog}
        onEscapeKeyDown={closeDialog}
      >
        {dialogOptions.title && (
          <DialogTitle id="alert-dialog-title" disableTypography>
            <Typography variant="h5" component="h1">
              {dialogOptions.title}
            </Typography>
          </DialogTitle>
        )}
        <DialogContent>
          {dialogOptions.renderContent(renderFunctionArgs)}
        </DialogContent>
        {typeof dialogOptions.renderActions === "function" && (
          <DialogActions className={classes.actions}>
            {dialogOptions.renderActions(renderFunctionArgs)}
          </DialogActions>
        )}
      </DialogContainer>

      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  return React.useContext(DialogContext);
};

const useStyles = makeStyles(theme => ({
  actions: {
    padding: theme.spacing(2),
  },
}));

import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { select, text, boolean } from "@storybook/addon-knobs";
import { useDialog, DialogProvider, RenderFunctionsType } from "./use-dialog";
import Button from "@material-ui/core/Button";

const DialogTrigger = (props: any) => {
  const { openDialog } = useDialog();
  const classes = useStyles();

  const handleClick = () => {
    openDialog({
      title: props.title,
      renderContent() {
        return (
          <div className={classes.dialogContent}>
            If you discard changes, you{"'"}ll delete any changes you{"'"}ve
            made since you last saved.
          </div>
        );
      },
      renderActions({ closeDialog }: RenderFunctionsType) {
        return (
          <>
            <Button
              size="small"
              variant="outlined"
              onClick={() => closeDialog()}
            >
              Discard
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => closeDialog()}
            >
              Save
            </Button>
          </>
        );
      },
      fullWidth: props.fullWidth,
      maxWidth: props.maxWidth,
      closeOnBackdropClick: props.closeOnBackdropClick,
      closeOnEscapeKey: props.closeOnEscapeKey,
    });
  };

  return <Button onClick={handleClick}>Open Dialog</Button>;
};

export const Dialog = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <DialogProvider>
        <DialogTrigger
          title={text("title", "Discard all unsaved changes")}
          fullWidth={boolean("fullWidth", false)}
          maxWidth={select("maxWidth", ["xs", "sm", "md", "lg", "xl"], "md")}
          closeOnBackdropClick={boolean("closeOnBackdropClick", true)}
          closeOnEscapeKey={boolean("closeOnEscapeKey", true)}
        />
      </DialogProvider>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    margin: theme.spacing(2),
  },
  dialogContent: {
    paddingBottom: theme.spacing(5),
  },
}));

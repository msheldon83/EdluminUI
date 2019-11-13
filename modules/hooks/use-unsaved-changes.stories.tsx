import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { select, text, boolean } from "@storybook/addon-knobs";
import {
  useUnsavedChanges,
  UnsavedChangesProvider,
} from "./use-unsaved-changes";
import Button from "@material-ui/core/Button";

const OpenUnsavedChangesTrigger = (props: any) => {
  const { openUnsavedChanges, closeUnsavedChanges } = useUnsavedChanges();

  const handleClick = () => {
    openUnsavedChanges({
      anchorElement: document.body,
      message: props.message,
      onSave: () => closeUnsavedChanges(),
      onDiscard: () => closeUnsavedChanges(),
    });
  };

  return (
    <Button onClick={handleClick} variant="contained">
      Preview UnsavedChanges banner
    </Button>
  );
};

export const UnsavedChanges = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <UnsavedChangesProvider>
        <OpenUnsavedChangesTrigger
          message={text("message", "This page has unsaved changes.")}
        />
      </UnsavedChangesProvider>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
  },
}));

import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import { UnsavedChanges } from "./unsaved-changes";

export default {
  title: "Components/",
};

export const UnsavedChangesStory = () => {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  return (
    <div className={classes.container}>
      <Button onClick={() => setOpen(true)} variant="contained">
        Preview UnsavedChanges banner
      </Button>
      <UnsavedChanges
        open={open}
        anchorElement={document.body}
        message="This page has unsaved changes."
        onSave={() => setOpen(false)}
        onDiscard={() => setOpen(false)}
      />
    </div>
  );
};

UnsavedChangesStory.story = {
  name: "Unsaved Changes",
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
  },
}));

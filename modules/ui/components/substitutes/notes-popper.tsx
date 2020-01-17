import { Fade, IconButton, makeStyles, Popper } from "@material-ui/core";
import * as React from "react";
import { ReceiptOutlined } from "@material-ui/icons";

type Props = {
  notes: string;
};

export const NotesPopper: React.FC<Props> = props => {
  const classes = useStyles();
  const [notesAnchor, setNotesAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const notesOpen = Boolean(notesAnchor);
  const notesId = notesOpen ? "notes-popper" : undefined;

  const handleShowNotes = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setNotesAnchor(notesAnchor ? null : event.currentTarget);
  };

  return (
    <>
      <IconButton id={notesId} onClick={handleShowNotes}>
        <ReceiptOutlined />
      </IconButton>
      <Popper
        transition
        open={notesOpen}
        anchorEl={notesAnchor}
        placement="bottom-end"
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <div className={classes.paper}>{props.notes}</div>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export const useStyles = makeStyles(theme => ({
  paper: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
}));

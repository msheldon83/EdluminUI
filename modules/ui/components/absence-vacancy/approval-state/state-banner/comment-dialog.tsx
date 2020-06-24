import * as React from "react";
import { Dialog, DialogContent, makeStyles } from "@material-ui/core";
import { LeaveComment } from "../leave-comment";

type Props = {
  approvalStateId: string;
  open: boolean;
  onClose: () => void;
  onSaveComment?: () => void;
  actingAsEmployee?: boolean;
  approvalWorkflowId: string;
};

export const CommentDialog: React.FC<Props> = props => {
  const classes = useStyles();

  const onSave = () => {
    if (props.onSaveComment) {
      props.onSaveComment();
    }
    props.onClose();
  };

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      fullWidth={true}
      maxWidth={"sm"}
    >
      <DialogContent className={classes.dialog}>
        <LeaveComment
          approvalStateId={props.approvalStateId}
          actingAsEmployee={props.actingAsEmployee}
          onSave={onSave}
          approvalWorkflowId={props.approvalWorkflowId}
        />
      </DialogContent>
    </Dialog>
  );
};

export const useStyles = makeStyles(theme => ({
  dialog: {
    height: 200,
    padding: theme.spacing(2),
  },
}));

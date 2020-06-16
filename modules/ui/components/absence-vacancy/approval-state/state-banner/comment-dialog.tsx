import * as React from "react";
import { Dialog, DialogContent } from "@material-ui/core";
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
      fullWidth={false}
      maxWidth={"sm"}
    >
      <DialogContent>
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

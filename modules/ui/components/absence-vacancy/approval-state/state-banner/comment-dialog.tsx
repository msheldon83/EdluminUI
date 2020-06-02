import * as React from "react";
import { Dialog, DialogContent } from "@material-ui/core";
import { LeaveComment } from "../leave-comment";

type Props = {
  approvalStateId: string;
  open: boolean;
  onClose: () => void;
  viewingAsEmployee?: boolean;
};

export const CommentDialog: React.FC<Props> = props => {
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
          viewingAsEmployee={props.viewingAsEmployee}
          onSave={props.onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

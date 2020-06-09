import * as React from "react";
import { Dialog, DialogContent } from "@material-ui/core";
import { LeaveComment } from "../leave-comment";

type Props = {
  approvalStateId: string;
  open: boolean;
  onClose: () => void;
  actingAsEmployee?: boolean;
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
          actingAsEmployee={props.actingAsEmployee}
          onSave={props.onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

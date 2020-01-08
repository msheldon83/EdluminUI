import * as React from "react";
import { CancelDialog } from "../cancel-dialog";
import { AssignmentGroupDetailUI } from "./assignment-group-detail-ui";

type Props = {
  locationName: string;
  startTimeLocal: string;
  endTimeLocal: string;
  dayPortion: number;
  shadeRow: boolean;
  onCancel: () => void;
  className?: string;
  isAdmin: boolean;
  forSpecificAssignment?: boolean;
};

export const AssignmentGroupDetail: React.FC<Props> = props => {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);

  const onCancelClick = () => setIsCancelDialogOpen(true);
  const onCloseDialog = () => setIsCancelDialogOpen(false);

  return (
    <>
      <CancelDialog
        open={isCancelDialogOpen}
        onClose={onCloseDialog}
        onCancel={props.onCancel}
      />
      <AssignmentGroupDetailUI {...props} onCancel={onCancelClick} />
    </>
  );
};

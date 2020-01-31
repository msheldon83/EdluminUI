import * as React from "react";
import { useCallback } from "react";
import { EmployeeAbsenceDetail } from "../types";
import { AbsenceDetailRowUI } from "./absence-detail-row-ui";
import { CancelAbsenceDialog } from "./cancel-absence-dialog";

type Props = {
  absence: EmployeeAbsenceDetail;
  cancelAbsence?: (absenceId: string) => Promise<void>;
  showAbsenceChip?: boolean;
  actingAsEmployee?: boolean;
  orgId?: string;
};

export const AbsenceDetailRow: React.FC<Props> = props => {
  const [dialogIsOpen, setDialogIsOpen] = React.useState(false);

  const onClickCancel = useCallback(() => setDialogIsOpen(true), [
    setDialogIsOpen,
  ]);

  return (
    <>
      <CancelAbsenceDialog
        open={dialogIsOpen}
        onClose={() => setDialogIsOpen(false)}
        onCancel={() => {
          props.cancelAbsence && props.cancelAbsence(props.absence.id);
          setDialogIsOpen(false);
        }}
      />
      <AbsenceDetailRowUI {...props} cancelAbsence={onClickCancel} />
    </>
  );
};

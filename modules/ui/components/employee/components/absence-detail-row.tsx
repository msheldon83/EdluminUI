import * as React from "react";
import { useCallback } from "react";
import { CancelDialog } from "ui/components/substitutes/assignment-row/cancel-dialog";
import { EmployeeAbsenceDetail } from "../types";
import { AbsenceDetailRowUI } from "./absence-detail-row-ui";

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
      <CancelDialog
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

import * as React from "react";
import { useCallback, useRef, useEffect } from "react";
import { EmployeeAbsenceDetail } from "../types";
import { AbsenceDetailRowUI } from "./absence-detail-row-ui";
import { CancelAbsenceDialog } from "./cancel-absence-dialog";

type Props = {
  absence: EmployeeAbsenceDetail;
  cancelAbsence: (absenceId: string) => Promise<void>;
  hideAbsence?: (absenceId: string) => Promise<void>;
  showAbsenceChip?: boolean;
  actingAsEmployee?: boolean;
  orgId?: string;
};

export const AbsenceDetailRow: React.FC<Props> = props => {
  const [dialogIsOpen, setDialogIsOpen] = React.useState(false);

  const onClickCancel = useCallback(() => setDialogIsOpen(true), [
    setDialogIsOpen,
  ]);

  const componentIsMounted = useRef(true);
  useEffect(() => {
    return () => {
      componentIsMounted.current = false;
    };
  }, []);

  return (
    <>
      <CancelAbsenceDialog
        open={dialogIsOpen}
        onClose={() => setDialogIsOpen(false)}
        onCancel={async () => {
          await props.cancelAbsence(props.absence.id);
          if (componentIsMounted.current) {
            setDialogIsOpen(false);
          }
        }}
      />
      <AbsenceDetailRowUI {...props} cancelAbsence={onClickCancel} />
    </>
  );
};

import * as React from "react";
import { useCallback } from "react";
import { CancelDialog } from "ui/components/substitutes/assignment-row/cancel-dialog";
import { EmployeeAbsenceDetail } from "../types";
import { AbsenceDetailRowUI } from "./absence-detail-row-ui";

type Props = {
  absence: EmployeeAbsenceDetail;
  cancelAbsence?: (absenceId: string) => Promise<void>;
  showAbsenceChip?: boolean;
  isAdmin?: boolean;
  orgId?: string;
};

export const AbsenceDetailRow: React.FC<Props> = props => {
  const [dialogIsOpen, setDialogIsOpen] = React.useState(false);

  const onClickCancel = useCallback(() => setDialogIsOpen(true), [
    setDialogIsOpen,
  ]);

  // const dateRangeDisplay = isEqual(
  //   props.absence.startDate,
  //   props.absence.endDate
  // )
  //   ? format(props.absence.startDate, "MMM d")
  //   : `${format(props.absence.startDate, "MMM d")} - ${format(
  //       props.absence.endDate,
  //       "MMM d"
  //     )}`;

  // const dayPortionLabel = React.useMemo(() => {
  //   const dayPortion = props.absence.totalDayPortion;
  //   if (dayPortion < 0.5) {
  //     return t("Partial day (hourly)");
  //   } else if (dayPortion === 0.5) {
  //     return t("Half day");
  //   } else if (dayPortion > 0.5 && dayPortion < 2) {
  //     return t("Full day");
  //   } else {
  //     return t("Full days");
  //   }
  // }, [props.absence.totalDayPortion, t]);

  // const dayPortionNumberDisplay = Math.round(props.absence.totalDayPortion);
  // const dayPortionDisplay =
  //   dayPortionNumberDisplay >= 1
  //     ? `${dayPortionNumberDisplay} ${dayPortionLabel}`
  //     : dayPortionLabel;

  // const employeeCancelWhileSubAssigned =
  //   !props.isAdmin && !!props.absence.substitute;

  // const cancelButton = (
  //   <Button
  //     variant="outlined"
  //     onClick={employeeCancelWhileSubAssigned ? undefined : props.cancelAbsence}
  //     className={[
  //       classes.cancelButton,
  //       employeeCancelWhileSubAssigned ? classes.disabledButton : "",
  //     ].join(" ")}
  //     disableTouchRipple={employeeCancelWhileSubAssigned}
  //   >
  //     {t("Cancel")}
  //   </Button>
  // );

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

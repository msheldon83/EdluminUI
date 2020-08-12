import * as React from "react";
import { useCallback } from "react";
import { AssignmentVacancyDetails } from "../../../pages/sub-schedule/types";
import { AssignmentRowUI } from "./assignment-row-ui";
import { CancelDialog } from "./cancel-dialog";
import { useTranslation } from "react-i18next";

type Props = {
  assignment: AssignmentVacancyDetails;
  onCancel: (
    assignmentId: string,
    rowVersion: string,
    vacancyDetailIds?: string[]
  ) => Promise<unknown>;
  className?: string;
  isAdmin: boolean;
  forSpecificAssignment?: boolean;
};

/* The purpose of this component is to handle the data coming out of
    of graphql in one place, rather than clutter any component that 
    uses it. */
export const AssignmentRow: React.FC<Props> = props => {
  const { t } = useTranslation();
  const a = props.assignment;
  const { onCancel } = props;

  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);

  const isFromVacancy = React.useMemo(() => {
    return !!a.vacancyReason;
  }, [a]);

  const confirmationNumber = a.assignment?.id ?? "";
  const employeeName = isFromVacancy
    ? `${t("Vacancy")}`
    : `${a.vacancy?.absence?.employee?.firstName} ${a.vacancy?.absence?.employee?.lastName}`;
  const absenceId = a.vacancy?.absence?.id;
  const vacancyId = a.vacancy?.id;
  const positionName = a?.vacancy?.position?.title ?? "";
  const organizationName = a?.vacancy?.organization?.name;
  const locationName = a?.location?.name ?? "";
  const onCancelClick = () => setIsCancelDialogOpen(true);
  const onCloseDialog = () => setIsCancelDialogOpen(false);
  const onCancelMutation = useCallback(async () => {
    await onCancel(a.assignment?.id ?? "", a.assignment?.rowVersion ?? "", [
      a.id ?? "",
    ]);
    onCloseDialog();
  }, [onCancel, a.assignment, a.id]);

  return (
    <>
      <CancelDialog
        open={isCancelDialogOpen}
        onClose={onCloseDialog}
        onConfirm={onCancelMutation}
      />

      <AssignmentRowUI
        confirmationNumber={confirmationNumber}
        startTime={a.startTimeLocal ?? ""}
        endTime={a.endTimeLocal ?? ""}
        employeeName={employeeName}
        multipleTimes={false}
        startDate={a.startDate ?? ""}
        endDate={a.endDate ?? ""}
        locationName={locationName}
        organizationName={organizationName}
        positionName={positionName}
        dayPortion={a.dayPortion}
        payInfoLabel={a.payInfo?.label ?? ""}
        notesToReplacement={a.vacancy?.notesToReplacement ?? undefined}
        onCancel={onCancelClick}
        className={props.className}
        absenceId={absenceId}
        vacancyId={vacancyId}
        isAdmin={props.isAdmin}
        forSpecificAssignment={props.forSpecificAssignment}
        canCancel={a.canCancel}
      />
    </>
  );
};

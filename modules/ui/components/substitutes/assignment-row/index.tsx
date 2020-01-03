import * as React from "react";
import { AssignmentRowUI } from "./assignment-row-ui";
import { AssignmentVacancyDetails } from "../../../pages/sub-schedule/types";
import { useCallback } from "react";

type Props = {
  assignment: AssignmentVacancyDetails;
  onCancel?: (
    assignmentId: string,
    rowVersion: string,
    vacancyDetailIds?: string[]
  ) => void;
  className?: string;
  isAdmin: boolean;
  forSpecificAssignment?: boolean;
};

/* The purpose of this component is to handle the data coming out of 
    of graphql in one place, rather than clutter any component that 
    uses it. */
export const AssignmentRow: React.FC<Props> = props => {
  const a = props.assignment;
  const { onCancel } = props;

  const confirmationNumber = a.assignment?.id ?? "";
  const employeeName = `${a.vacancy?.absence?.employee?.firstName} ${a.vacancy?.absence?.employee?.lastName}`;
  const positionName = a?.vacancy?.position?.name ?? "";
  const organizationName = a?.vacancy?.organization?.name;
  const locationName = a?.location?.name ?? "";
  const onCancelMutation = useCallback(
    () =>
      onCancel!(
        a.assignment?.id ?? "",
        a.assignment?.rowVersion ?? "",
        undefined
      ),
    [onCancel, a.assignment]
  );

  return (
    <>
      {onCancel && (
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
          onCancel={onCancelMutation}
          className={props.className}
          isAdmin={props.isAdmin}
          forSpecificAssignment={props.forSpecificAssignment}
        />
      )}
      {onCancel === undefined && (
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
          className={props.className}
          isAdmin={props.isAdmin}
          forSpecificAssignment={props.forSpecificAssignment}
        />
      )}
    </>
  );
};

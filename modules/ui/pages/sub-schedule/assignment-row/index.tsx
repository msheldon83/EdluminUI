import * as React from "react";
import { AssignmentRowUI } from "./assignment-row-ui";

// Mirrors gql type
type AssignmentDetails = {
  id?: string;
  assignment: {
    id: string;
  } | null;
  startDate?: string;
  endDate?: string;
  startTimeLocal?: string;
  endTimeLocal?: string;
  dayPortion: number;
  location: {
    name?: string;
  } | null;
  vacancy: {
    organization: { name?: string };
    position: {
      name?: string;
    } | null;
    absence: {
      employee: {
        firstName: string;
        lastName: string;
      } | null;
    } | null;
  } | null;
};

type Props = {
  assignment: AssignmentDetails;
  onCancel: () => void;
  className?: string;
};

/* The purpose of this component is to handle the data coming out of 
    of graphql in one place, rather than clutter any component that 
    uses it. */
export const AssignmentRow: React.FC<Props> = props => {
  const a = props.assignment;

  const confirmationNumber = a.assignment?.id || "";
  const employeeName = `${a.vacancy?.absence?.employee?.firstName} ${a.vacancy?.absence?.employee?.lastName}`;
  const positionName = a?.vacancy?.position?.name || "";
  const organizationName = a?.vacancy?.organization?.name;
  const locationName = a?.location?.name || "";

  return (
    <AssignmentRowUI
      confirmationNumber={confirmationNumber}
      startTime={a.startTimeLocal || ""}
      endTime={a.endTimeLocal || ""}
      employeeName={employeeName}
      startDate={a.startDate || ""}
      endDate={a.endDate || ""}
      locationName={locationName}
      organizationName={organizationName}
      positionName={positionName}
      dayPortion={a.dayPortion}
      onCancel={props.onCancel}
      className={props.className}
    />
  );
};

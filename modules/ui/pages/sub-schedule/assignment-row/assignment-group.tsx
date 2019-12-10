import * as React from "react";
import { AssignmentRowUI } from "./assignment-row-ui";
import { AssignmentVacancyDetails } from "../types";
import parseISO from "date-fns/parseISO";
import format from "date-fns/format";
import isEqual from "date-fns/isEqual";

type Props = {
  assignmentGroup: AssignmentVacancyDetails[];
  onCancel: () => void;
  className?: string;
};

/*  1. handle collapse/expand state
    2. do the parsing to get date range
    3. location(s)
    4. total day portions
    5. ??
    */

export const AssignmentGroup: React.FC<Props> = props => {
  const assignment = props.assignmentGroup;

  const vacancy = assignment[0].vacancy !== null && assignment[0].vacancy;
  if (!vacancy) return <></>;

  const locationNames = [...new Set(assignment.map(a => a.location!.name))];
  const locationNameText =
    locationNames.length > 1
      ? `${locationNames[0]} +${locationNames.length - 1}`
      : locationNames[0];

  const orgNames = [
    ...new Set(assignment.map(a => a.vacancy!.organization.name)),
  ];
  const orgNameText =
    orgNames.length > 1
      ? `${orgNames[0]} +${orgNames.length - 1}`
      : orgNames[0];

  const confirmationNumber = vacancy.id;
  const employeeName = `${vacancy.absence?.employee?.firstName} ${vacancy.absence?.employee?.lastName}`;
  const positionName = vacancy.position?.name ?? "";

  // below will need to change
  const startTime = assignment[0].startTimeLocal!;
  const endTime = assignment[0].endTimeLocal!;
  const totalDayPortion = assignment[0].dayPortion;

  const lastAssignment = assignment[assignment.length - 1];
  const startDate = assignment[0].startDate!;

  /* the vacancy details come back from the server sorted by date,
   so this should be the latest date for the vacancy */
  const endDate = lastAssignment.endDate!;

  return (
    <>
      <AssignmentRowUI
        confirmationNumber={confirmationNumber}
        startTime={startTime}
        endTime={endTime}
        employeeName={employeeName}
        startDate={startDate}
        endDate={endDate}
        locationName={locationNameText || ""}
        organizationName={orgNameText}
        positionName={positionName}
        dayPortion={totalDayPortion}
        onCancel={props.onCancel}
        className={props.className}
      />
      I can expand! Click to see more:{" "}
      {`${props.assignmentGroup.map(a => a.startDate?.toString())}`}
    </>
  );
};

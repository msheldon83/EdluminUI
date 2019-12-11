import * as React from "react";
import { AssignmentRowUI } from "./assignment-row-ui";
import { AssignmentVacancyDetails } from "../types";
import { useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { classNames } from "react-select/src/utils";
import { AvailableJobDetail } from "ui/pages/sub-home/components/available-job-detail";
import { parseDayPortion } from "ui/components/helpers";
import { AssignmentGroupDetail } from "./assignment-group-detail";

type Props = {
  assignmentGroup: AssignmentVacancyDetails[];
  onCancel: () => void;
  className?: string;
};

/*  1. handle collapse/expand state
    2. org(s)
    3. location(s)
    4. total day portions
    5. ??
    */

export const AssignmentGroup: React.FC<Props> = props => {
  const [isExpanded, setIsExpanded] = useState(false);
  const classes = useStyles(isExpanded);

  const assignment = props.assignmentGroup;

  const vacancy = assignment[0].vacancy !== null && assignment[0].vacancy;
  if (!vacancy || !assignment[0].assignment) return <></>;

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

  const confirmationNumber = assignment[0].assignment.id;
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
    <div
      className={classes.container}
      onClick={() => setIsExpanded(!isExpanded)}
    >
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
        className={[classes.mainRow, props.className].join(" ")}
      />
      {isExpanded && (
        <div className={[classes.container, classes.expandedDetails].join(" ")}>
          {props.assignmentGroup.map((a, i) => (
            <AssignmentGroupDetail
              dayPortion={a.dayPortion}
              startTimeLocal={a.startTimeLocal ?? ""}
              endTimeLocal={a.endTimeLocal ?? ""}
              locationName={a.location?.name ?? ""}
              shadeRow={i % 2 != 0}
              key={i}
              onCancel={() => console.log(a)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
  },
  mainRow: (isExpanded: boolean) => ({
    paddingBottom: isExpanded ? theme.spacing(1) : theme.spacing(2),
  }),
  expandedDetails: {
    marginBottom: theme.spacing(2),
  },
}));

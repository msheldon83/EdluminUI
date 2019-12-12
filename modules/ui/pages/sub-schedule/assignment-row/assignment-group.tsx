import { makeStyles } from "@material-ui/styles";
import { formatIsoDateIfPossible } from "helpers/date";
import { groupBy } from "lodash-es";
import * as React from "react";
import { useState } from "react";
import { AssignmentVacancyDetails } from "../types";
import { AssignmentGroupDetail } from "./assignment-group-detail";
import { AssignmentRowUI } from "./assignment-row-ui";

type Props = {
  assignmentGroup: AssignmentVacancyDetails[];
  onCancel: () => void;
  className?: string;
};

export const AssignmentGroup: React.FC<Props> = props => {
  const classes = useStyles();
  const [isExpanded, setIsExpanded] = useState(false);

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

  let totalDayPortion = 0;
  assignment.map(a => (totalDayPortion += a.dayPortion));

  const lastAssignment = assignment[assignment.length - 1];
  const startDate = assignment[0].startDate!;

  /* the vacancy details come back from the server sorted by date,
  so this should be the latest date for the vacancy */
  const endDate = lastAssignment.endDate!;

  const multipleStarts =
    Object.entries(
      groupBy(assignment, a =>
        formatIsoDateIfPossible(a.startTimeLocal, "h:mm aaa")
      )
    ).length > 1;
  const multipleEndTimes =
    Object.entries(
      groupBy(assignment, a =>
        formatIsoDateIfPossible(a.endTimeLocal, "h:mm aaa")
      )
    ).length > 1;
  const multipleTimes = multipleStarts && multipleEndTimes;

  const times = multipleTimes
    ? { multipleTimes }
    : {
        multipleTimes,
        endTime: assignment[0].endTimeLocal!,
      };

  return (
    <div
      className={classes.container}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <AssignmentRowUI
        confirmationNumber={confirmationNumber}
        {...times}
        startTime={assignment[0].startTimeLocal!}
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
  expandedDetails: {
    marginBottom: theme.spacing(2),
  },
}));

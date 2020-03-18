import { makeStyles } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { AssignmentWithDetails, AssignmentFor } from "./types";
import { UnfilledBanner } from "./unfilled-banner";
import { AssignedBanner } from "./assigned-banner";
import { DateGroup } from "./date-group";

type Props = {
  assignmentWithDetails: AssignmentWithDetails;
  isPartiallyFilled: boolean;
  showAbsenceTimes: boolean;
  onAssignClick: (currentAssignmentInfo: AssignmentFor) => Promise<void>;
  onRemoveClick: (currentAssignmentInfo: AssignmentFor) => Promise<void>;
};

export const AssignmentGroup: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const {
    assignmentWithDetails,
    isPartiallyFilled,
    showAbsenceTimes,
    onAssignClick,
    onRemoveClick,
  } = props;

  const showUnfilledHeader =
    !assignmentWithDetails.assignment && isPartiallyFilled;
  const isAssigned = !!assignmentWithDetails.assignment;

  return (
    <div>
      {showUnfilledHeader && (
        <UnfilledBanner
          onAssignClick={async () => onAssignClick(assignmentWithDetails)}
        />
      )}
      {isAssigned && (
        <AssignedBanner
          assignedTo={assignmentWithDetails}
          onReassignClick={async () => onAssignClick(assignmentWithDetails)}
          onRemoveClick={async () => onRemoveClick(assignmentWithDetails)}
        />
      )}
      <DateGroup
        dateDetails={assignmentWithDetails}
        showAbsenceTimes={showAbsenceTimes}
      />
    </div>
  );
};

export const useStyles = makeStyles(theme => ({}));

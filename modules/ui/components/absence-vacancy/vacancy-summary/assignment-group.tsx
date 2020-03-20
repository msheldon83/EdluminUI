import { makeStyles } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { AssignmentWithDetails, Assignment, AssignmentFor } from "./types";
import { UnfilledBanner } from "./unfilled-banner";
import { AssignedBanner } from "./assigned-banner";
import { DateGroup } from "./date-group";

type Props = {
  assignmentWithDetails: AssignmentWithDetails;
  isPartiallyFilled: boolean;
  showPayCodes: boolean;
  showAccountingCodes: boolean;
  showAbsenceTimes: boolean;
  onAssignClick?: (currentAssignmentInfo: AssignmentFor) => void;
  onCancelAssignment: (vacancyDetailIds: string[]) => Promise<void>;
  disableActions?: boolean;
  detailsOnly?: boolean;
};

export const AssignmentGroup: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const {
    assignmentWithDetails,
    isPartiallyFilled,
    showAbsenceTimes,
    onAssignClick,
    onCancelAssignment,
    showPayCodes,
    showAccountingCodes,
    disableActions = false,
    detailsOnly = false,
  } = props;

  const showUnfilledHeader =
    !assignmentWithDetails.assignment && isPartiallyFilled;
  const isAssigned = !!assignmentWithDetails.assignment;

  return (
    <div>
      {!detailsOnly && (
        <>
          {showUnfilledHeader && (
            <UnfilledBanner
              onAssignClick={
                onAssignClick
                  ? () => onAssignClick(assignmentWithDetails)
                  : undefined
              }
              assignmentStartTime={assignmentWithDetails.startDateAndTimeLocal}
              disableActions={disableActions}
            />
          )}
          {isAssigned && (
            <AssignedBanner
              assignmentWithDetails={assignmentWithDetails}
              assignmentStartTime={assignmentWithDetails.startDateAndTimeLocal}
              onReassignClick={
                onAssignClick
                  ? () => onAssignClick(assignmentWithDetails)
                  : undefined
              }
              onCancelAssignment={onCancelAssignment}
              disableActions={disableActions}
            />
          )}
        </>
      )}
      <DateGroup
        dateDetails={assignmentWithDetails}
        showAbsenceTimes={showAbsenceTimes}
        showPayCodes={showPayCodes}
        showAccountingCodes={showAccountingCodes}
      />
    </div>
  );
};

export const useStyles = makeStyles(theme => ({}));

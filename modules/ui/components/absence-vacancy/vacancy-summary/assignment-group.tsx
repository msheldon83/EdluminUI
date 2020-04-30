import * as React from "react";
import { AssignmentWithDetails, AssignmentFor } from "./types";
import { UnfilledBanner } from "./unfilled-banner";
import { AssignedBanner } from "./assigned-banner";
import { DateGroup } from "./date-group";
import { makeStyles } from "@material-ui/core";

type Props = {
  orgId: string;
  assignmentWithDetails: AssignmentWithDetails;
  isPartiallyFilled: boolean;
  showPayCodes: boolean;
  showAccountingCodes: boolean;
  showAbsenceTimes: boolean;
  onAssignClick?: (currentAssignmentInfo: AssignmentFor) => void;
  onCancelAssignment: (vacancyDetailIds: string[]) => Promise<void>;
  disableActions?: boolean;
  detailsOnly?: boolean;
  readOnly: boolean;
};

export const AssignmentGroup: React.FC<Props> = props => {
  const classes = useStyles();
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
    <div className={isAssigned ? classes.filledGroup : classes.unfilledGroup}>
      <DateGroup
        orgId={props.orgId}
        dateDetails={assignmentWithDetails}
        showAbsenceTimes={showAbsenceTimes}
        showPayCodes={showPayCodes}
        showAccountingCodes={showAccountingCodes}
        readOnly={props.readOnly}
      />
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
              orgId={props.orgId}
              assignmentWithDetails={assignmentWithDetails}
              assignmentStartTime={assignmentWithDetails.startDateAndTimeLocal}
              onReassignClick={
                onAssignClick
                  ? () => onAssignClick(assignmentWithDetails)
                  : undefined
              }
              onCancelAssignment={onCancelAssignment}
              disableActions={disableActions}
              readOnly={props.readOnly}
            />
          )}
        </>
      )}
    </div>
  );
};

export const useStyles = makeStyles(theme => ({
  filledGroup: {
    backgroundColor: "#ECF9F3",
    marginBottom: theme.typography.pxToRem(10),
  },
  unfilledGroup: {
    backgroundColor: theme.customColors.lighterGray,
    marginBottom: theme.typography.pxToRem(10),
  },
}));

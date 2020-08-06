import * as React from "react";
import { AssignmentWithDetails, VacancySummaryDetail } from "./types";
import { UnfilledBanner } from "./unfilled-banner";
import { AssignedBanner } from "./assigned-banner";
import { DateGroup } from "./date-group";
import { makeStyles } from "@material-ui/core";

type Props = {
  assignmentWithDetails: AssignmentWithDetails;
  isExistingVacancy: boolean;
  isPartiallyFilled: boolean;
  showPayCodes: boolean;
  showAccountingCodes: boolean;
  showAbsenceTimes: boolean;
  onAssignClick?: (
    vacancySummaryDetails: VacancySummaryDetail[]
  ) => Promise<void>;
  onCancelAssignment?: (
    vacancySummaryDetails: VacancySummaryDetail[]
  ) => Promise<boolean>;
  disableActions?: boolean;
  detailsOnly?: boolean;
  readOnly: boolean;
  allowRemoval?: boolean;
};

export const AssignmentGroup: React.FC<Props> = props => {
  const classes = useStyles();
  const {
    assignmentWithDetails,
    isExistingVacancy,
    isPartiallyFilled,
    showAbsenceTimes,
    onAssignClick,
    onCancelAssignment,
    showPayCodes,
    showAccountingCodes,
    disableActions = false,
    detailsOnly = false,
    allowRemoval = false,
  } = props;

  const showUnfilledHeader =
    !assignmentWithDetails.assignment && isPartiallyFilled;
  const isAssigned = !!assignmentWithDetails.assignment;

  return (
    <div className={isAssigned ? classes.filledGroup : classes.unfilledGroup}>
      <DateGroup
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
              assignmentWithDetails={assignmentWithDetails}
              onAssignClick={onAssignClick}
              assignmentStartTime={assignmentWithDetails.startDateAndTimeLocal}
              disableActions={disableActions}
              isExistingVacancy={isExistingVacancy}
            />
          )}
          {isAssigned && (
            <AssignedBanner
              assignmentWithDetails={assignmentWithDetails}
              assignmentStartTime={assignmentWithDetails.startDateAndTimeLocal}
              onReassignClick={onAssignClick}
              onCancelAssignment={onCancelAssignment}
              disableActions={disableActions}
              readOnly={props.readOnly}
              allowRemoval={allowRemoval}
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

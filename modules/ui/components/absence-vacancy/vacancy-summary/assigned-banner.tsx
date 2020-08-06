import { makeStyles, Button, Typography, Divider } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { AssignmentWithDetails, VacancySummaryDetail } from "./types";
import { Can } from "ui/components/auth/can";
import { AccountCircleOutlined } from "@material-ui/icons";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { canRemoveSub, canReassignSub } from "helpers/permissions";
import { AssignmentDialog } from "./assignment-dialog";
import { useState, useCallback } from "react";
import { SubstituteLink } from "ui/components/links/people";
import { useIsMount } from "hooks/use-is-mount";

type Props = {
  assignmentWithDetails: AssignmentWithDetails;
  assignmentStartTime: Date;
  onReassignClick?: (
    vacancySummaryDetails: VacancySummaryDetail[]
  ) => Promise<void>;
  onCancelAssignment?: (
    vacancySummaryDetails: VacancySummaryDetail[]
  ) => Promise<boolean>;
  disableActions?: boolean;
  readOnly: boolean;
  allowRemoval?: boolean;
};

export const AssignedBanner: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMount = useIsMount();
  const {
    assignmentWithDetails,
    assignmentStartTime,
    onReassignClick,
    onCancelAssignment,
    disableActions = false,
    allowRemoval = false,
  } = props;

  const isExistingAssignment = !!assignmentWithDetails.assignment?.id;
  const employeeName = `${assignmentWithDetails.assignment?.employee
    ?.firstName ?? ""} ${assignmentWithDetails.assignment?.employee?.lastName ??
    ""}`;

  const [
    cancelAssignmentDialogIsOpen,
    setCancelAssignmentDialogIsOpen,
  ] = useState<boolean>(false);
  const onLocalRemoveClick = useCallback(async () => {
    if (!onCancelAssignment) {
      return;
    }

    if (assignmentWithDetails.vacancySummaryDetails.length === 1) {
      // Cancelling an assignment for a single vacancy detail, no need to prompt the user
      await onCancelAssignment(assignmentWithDetails.vacancySummaryDetails);
    } else {
      // Cancelling an assignment covering multiple vacancy details, want to ask the user what they want to do
      setCancelAssignmentDialogIsOpen(true);
    }
  }, [onCancelAssignment, assignmentWithDetails]);

  const [
    reassignAssignmentDialogIsOpen,
    setReassignAssignmentDialogIsOpen,
  ] = useState<boolean>(false);
  const onLocalReassignClick = useCallback(async () => {
    if (!onReassignClick) {
      return;
    }

    if (assignmentWithDetails.vacancySummaryDetails.length === 1) {
      // Reassigning a single vacancy detail, no need to prompt the user
      await onReassignClick(assignmentWithDetails.vacancySummaryDetails);
    } else {
      // Reassigning an assignment covering multiple vacancy details, want to ask the user what they want to do
      setReassignAssignmentDialogIsOpen(true);
    }
  }, [onReassignClick, assignmentWithDetails]);

  return (
    <>
      {onCancelAssignment && (
        <AssignmentDialog
          action={"cancel"}
          onSubmit={onCancelAssignment}
          onClose={() => isMount && setCancelAssignmentDialogIsOpen(false)}
          open={cancelAssignmentDialogIsOpen}
          vacancySummaryDetails={assignmentWithDetails.vacancySummaryDetails}
          assignment={assignmentWithDetails.assignment}
        />
      )}
      {onReassignClick && (
        <AssignmentDialog
          action={"reassign"}
          onSubmit={onReassignClick}
          onClose={() => isMount && setReassignAssignmentDialogIsOpen(false)}
          open={reassignAssignmentDialogIsOpen}
          vacancySummaryDetails={assignmentWithDetails.vacancySummaryDetails}
          assignment={assignmentWithDetails.assignment}
        />
      )}
      <Divider className={classes.divider} />
      <div className={classes.assignedBanner}>
        <div className={classes.employeeInfo}>
          <AccountCircleOutlined fontSize="large" />
          <div className={classes.name}>
            <Typography variant="h6">
              <SubstituteLink
                orgUserId={assignmentWithDetails.assignment?.employee?.id}
                disabled={props.readOnly}
              >
                {employeeName}
              </SubstituteLink>
            </Typography>
            <div className={classes.subText}>
              {isExistingAssignment ? t("assigned") : t("pre-arranged")}
            </div>
            {assignmentWithDetails.assignment?.id && (
              <div className={[classes.subText, classes.assignment].join(" ")}>
                {t("#C") + assignmentWithDetails.assignment?.id}
              </div>
            )}
          </div>
        </div>

        <div className={classes.actions}>
          {onReassignClick && (
            <Can
              do={(
                permissions: OrgUserPermissions[],
                isSysAdmin: boolean,
                orgId?: string,
                forRole?: Role | null | undefined
              ) =>
                canReassignSub(
                  assignmentStartTime,
                  permissions,
                  isSysAdmin,
                  orgId,
                  forRole
                )
              }
            >
              <Button
                variant="outlined"
                onClick={onLocalReassignClick}
                disabled={disableActions}
                className={classes.reassignButton}
              >
                {t("Reassign")}
              </Button>
            </Can>
          )}
          {onCancelAssignment && (
            <Can
              do={(
                permissions: OrgUserPermissions[],
                isSysAdmin: boolean,
                orgId?: string,
                forRole?: Role | null | undefined
              ) => {
                if (allowRemoval) {
                  return true;
                }

                return canRemoveSub(
                  assignmentStartTime,
                  permissions,
                  isSysAdmin,
                  orgId,
                  forRole
                );
              }}
            >
              <Button
                disabled={disableActions}
                variant={"outlined"}
                onClick={onLocalRemoveClick}
                className={classes.removeButton}
              >
                {t("Remove")}
              </Button>
            </Can>
          )}
        </div>
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  assignedBanner: {
    display: "flex",
    padding: theme.spacing(2),
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  divider: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },

  employeeInfo: {
    display: "flex",
    alignItems: "center",
  },
  name: {
    marginLeft: theme.spacing(2),
  },
  subText: {
    fontSize: theme.typography.pxToRem(12),
    display: "inline-block",
  },
  assignment: {
    marginLeft: theme.typography.pxToRem(10),
  },
  actions: {
    width: theme.typography.pxToRem(220),
    flexWrap: "wrap",
    textAlign: "right",
  },
  reassignButton: {
    marginRight: theme.typography.pxToRem(5),
  },
  removeButton: {
    color: "#C62822",
  },
}));

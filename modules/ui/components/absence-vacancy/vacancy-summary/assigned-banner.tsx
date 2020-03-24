import { makeStyles, Button, Typography } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { AssignmentWithDetails, Assignment } from "./types";
import { Can } from "ui/components/auth/can";
import { AccountCircleOutlined } from "@material-ui/icons";
import { OrgUserPermissions } from "ui/components/auth/types";
import { canRemoveSub, canReassignSub } from "helpers/permissions";
import { CancelAssignmentDialog } from "./cancel-assignment-dialog";
import { useState, useCallback, useRef, useEffect } from "react";

type Props = {
  assignmentWithDetails: AssignmentWithDetails;
  assignmentStartTime: Date;
  onReassignClick?: () => void;
  onCancelAssignment: (vacancyDetailIds: string[]) => Promise<void>;
  disableActions?: boolean;
};

export const AssignedBanner: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [
    cancelAssignmentDialogIsOpen,
    setCancelAssignmentDialogIsOpen,
  ] = useState<boolean>(false);
  const {
    assignmentWithDetails,
    assignmentStartTime,
    onReassignClick,
    onCancelAssignment,
    disableActions = false,
  } = props;

  const isExistingAssignment = !!assignmentWithDetails.assignment?.id;
  const employeeName = `${assignmentWithDetails.assignment?.employee
    ?.firstName ?? ""} ${assignmentWithDetails.assignment?.employee?.lastName ??
    ""}`;

  const onRemoveClick = useCallback(async () => {
    if (assignmentWithDetails.dates.length === 1) {
      // Cancelling an assignment for a single day, no need to prompt the user
      await onCancelAssignment(assignmentWithDetails.vacancyDetailIds);
    } else {
      // Cancelling a multi day assignment, want to ask the user what they want to do
      setCancelAssignmentDialogIsOpen(true);
    }
  }, [onCancelAssignment, assignmentWithDetails]);

  const componentIsMounted = useRef(true);
  useEffect(() => {
    return () => {
      componentIsMounted.current = false;
    };
  }, []);

  return (
    <>
      <CancelAssignmentDialog
        onCancelAssignment={onCancelAssignment}
        onClose={() =>
          componentIsMounted.current && setCancelAssignmentDialogIsOpen(false)
        }
        open={cancelAssignmentDialogIsOpen}
        assignmentWithDetails={assignmentWithDetails}
      />
      <div className={classes.assignedBanner}>
        <div className={classes.employeeInfo}>
          <AccountCircleOutlined fontSize="large" />
          <div className={classes.name}>
            <Typography variant="h6">{employeeName}</Typography>
            <div className={classes.subText}>
              {isExistingAssignment ? t("assigned") : t("pre-arranged")}
            </div>
          </div>
        </div>
        {assignmentWithDetails.assignment?.id && (
          <div>{t("#C") + assignmentWithDetails.assignment?.id}</div>
        )}
        <div className={classes.actions}>
          {onReassignClick && (
            <Can
              do={(
                permissions: OrgUserPermissions[],
                isSysAdmin: boolean,
                orgId?: string
              ) =>
                canReassignSub(
                  assignmentStartTime,
                  permissions,
                  isSysAdmin,
                  orgId
                )
              }
            >
              <Button
                variant="text"
                onClick={onReassignClick}
                disabled={disableActions}
              >
                {t("Reassign")}
              </Button>
            </Can>
          )}
          <Can
            do={(
              permissions: OrgUserPermissions[],
              isSysAdmin: boolean,
              orgId?: string
            ) =>
              canRemoveSub(assignmentStartTime, permissions, isSysAdmin, orgId)
            }
          >
            <Button
              disabled={disableActions}
              variant={"text"}
              onClick={onRemoveClick}
            >
              {t("Remove")}
            </Button>
          </Can>
        </div>
      </div>
    </>
  );
};

export const useStyles = makeStyles(theme => ({
  assignedBanner: {
    display: "flex",
    padding: theme.spacing(2),
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#ECF9F3",
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
  },
  actions: {
    width: theme.typography.pxToRem(100),
    flexWrap: "wrap",
    textAlign: "center",
  },
}));

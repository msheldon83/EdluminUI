import { makeStyles, Button, Typography, Divider } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { AssignmentWithDetails } from "./types";
import { Can } from "ui/components/auth/can";
import { AccountCircleOutlined } from "@material-ui/icons";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { canRemoveSub, canReassignSub } from "helpers/permissions";
import { CancelAssignmentDialog } from "./cancel-assignment-dialog";
import { useState, useCallback, useRef, useEffect } from "react";
import { SubstituteLink } from "ui/components/links/people";
import { compact } from "lodash-es";

type Props = {
  assignmentWithDetails: AssignmentWithDetails;
  assignmentStartTime: Date;
  onReassignClick?: () => void;
  onCancelAssignment?: (
    vacancyDetailIds: string[],
    vacancyDetailDates?: Date[]
  ) => Promise<void>;
  disableActions?: boolean;
  readOnly: boolean;
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
    if (!onCancelAssignment) {
      return;
    }

    if (assignmentWithDetails.dates.length === 1) {
      // Cancelling an assignment for a single day, no need to prompt the user
      await onCancelAssignment(
        compact(assignmentWithDetails.vacancyDetailIds),
        compact(assignmentWithDetails.dates)
      );
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
      {onCancelAssignment && (
        <CancelAssignmentDialog
          onCancelAssignment={onCancelAssignment}
          onClose={() =>
            componentIsMounted.current && setCancelAssignmentDialogIsOpen(false)
          }
          open={cancelAssignmentDialogIsOpen}
          assignmentWithDetails={assignmentWithDetails}
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
                onClick={onReassignClick}
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
              ) =>
                canRemoveSub(
                  assignmentStartTime,
                  permissions,
                  isSysAdmin,
                  orgId,
                  forRole
                )
              }
            >
              <Button
                disabled={disableActions}
                variant={"outlined"}
                onClick={onRemoveClick}
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

export const useStyles = makeStyles(theme => ({
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
    textAlign: "center",
  },
  reassignButton: {
    marginRight: theme.typography.pxToRem(5),
  },
  removeButton: {
    color: "#C62822",
  },
}));

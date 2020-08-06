import { makeStyles, Typography, Divider } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { AssignmentWithDetails, VacancySummaryDetail } from "./types";
import { AccountCircleOutlined } from "@material-ui/icons";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { canRemoveSub, canReassignSub } from "helpers/permissions";
import { SubstituteLink } from "ui/components/links/people";
import { FilteredAssignmentButton } from "./filtered-assignment-button";

type Props = {
  assignmentWithDetails: AssignmentWithDetails;
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
  const {
    assignmentWithDetails,
    onReassignClick,
    onCancelAssignment,
    disableActions = false,
    allowRemoval = false,
  } = props;

  const isExistingAssignment = !!assignmentWithDetails.assignment?.id;
  const employeeName = `${assignmentWithDetails.assignment?.employee
    ?.firstName ?? ""} ${assignmentWithDetails.assignment?.employee?.lastName ??
    ""}`;

  return (
    <>
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
            <FilteredAssignmentButton
              details={assignmentWithDetails.vacancySummaryDetails}
              action={"reassign"}
              permissionCheck={canReassignSub}
              disableAction={disableActions}
              onClick={onReassignClick}
              assignment={assignmentWithDetails.assignment}
            />
          )}
          {onCancelAssignment && (
            <FilteredAssignmentButton
              details={assignmentWithDetails.vacancySummaryDetails}
              action={"cancel"}
              permissionCheck={(
                absDate: Date,
                permissions: OrgUserPermissions[],
                isSysAdmin: boolean,
                orgId?: string,
                forRole?: Role | null | undefined
              ) => {
                if (allowRemoval) {
                  return true;
                }

                return canRemoveSub(
                  absDate,
                  permissions,
                  isSysAdmin,
                  orgId,
                  forRole
                );
              }}
              disableAction={disableActions}
              onClick={onCancelAssignment}
              assignment={assignmentWithDetails.assignment}
            />
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

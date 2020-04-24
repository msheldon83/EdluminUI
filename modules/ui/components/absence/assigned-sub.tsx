import * as React from "react";
import { makeStyles, Button, Typography, Link } from "@material-ui/core";
import { AccountCircleOutlined } from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import { Vacancy, PermissionEnum } from "graphql/server-types.gen";
import { Can } from "../auth/can";
import { canRemoveSub, canReassignSub } from "helpers/permissions";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { CancelAssignmentDialog } from "./cancel-assignment-dialog";
import { useState, useMemo, useCallback } from "react";
import { getGroupedVacancyDetails } from "./helpers";
import { flatMap, uniq } from "lodash-es";
import { AssignmentOnDate } from "./types";
import { MailOutline } from "@material-ui/icons";

type Props = {
  employeeId: string;
  employeeName: string;
  vacancies: Vacancy[];
  subText?: string;
  assignmentId?: string;
  assignmentRowVersion?: string;
  assignmentStartDate: Date;
  assignmentsByDate: AssignmentOnDate[];
  onAssignSubClick?: () => void;
  onCancelAssignment?: (
    assignmentId?: string,
    assignmentRowVersion?: string,
    vacancyDetailIds?: string[]
  ) => Promise<void>;
  disableReplacementInteractions?: boolean;
  showLinkButton?: boolean;
  email?: string;
};

export const AssignedSub: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [
    cancelAssignmentDialogIsOpen,
    setCancelAssignmentDialogIsOpen,
  ] = useState(false);

  const allGroupedDetails = useMemo(() => {
    return getGroupedVacancyDetails(props.vacancies, props.assignmentsByDate);
  }, [props.vacancies, props.assignmentsByDate]);

  const { assignmentId, onCancelAssignment } = props;
  const onClickRemove = useCallback(async () => {
    if (!onCancelAssignment) {
      // Shouldn't occur, but just in case
      return;
    }

    if (!assignmentId) {
      // Removing a pre-arranged Sub when creating the Absence
      await onCancelAssignment();
      return;
    }

    // Determine if the same Assignment is across multiple days
    const matchingGroups = allGroupedDetails.filter(
      x => x.assignmentId && x.assignmentId === assignmentId
    );
    const allDates = uniq(
      flatMap(matchingGroups.map(g => g.detailItems.map(di => di.date)))
    );

    if (allDates.length > 1) {
      // Need User input for how they want to proceed
      setCancelAssignmentDialogIsOpen(true);
    } else {
      // Go ahead and just cancel this Assignment
      await onCancelAssignment(
        matchingGroups[0].assignmentId,
        matchingGroups[0].assignmentRowVersion
      );
    }
  }, [
    setCancelAssignmentDialogIsOpen,
    assignmentId,
    onCancelAssignment,
    allGroupedDetails,
  ]);

  return (
    <>
      {props.onCancelAssignment && props.assignmentId && (
        <CancelAssignmentDialog
          onCancelAssignment={props.onCancelAssignment}
          onClose={() => setCancelAssignmentDialogIsOpen(false)}
          open={cancelAssignmentDialogIsOpen}
          assignmentId={props.assignmentId}
          allDetailGroups={allGroupedDetails}
        />
      )}
      <div className={classes.container}>
        <div className={classes.details}>
          <AccountCircleOutlined fontSize="large" />
          <div className={classes.name}>
            <Typography variant="h6" className={classes.nameLabel}>
              {props.employeeName}
            </Typography>
            <Can do={[PermissionEnum.SubstituteViewEmail]}>
              {props.email && (
                <Button
                  startIcon={<MailOutline />}
                  href={`mailto:${props.email}`}
                />
              )}
            </Can>
            {props.subText && (
              <div className={classes.subText}>{props.subText}</div>
            )}
          </div>
        </div>
        {props.assignmentId === undefined ? (
          <></>
        ) : (
          <div>{t("#C") + props.assignmentId}</div>
        )}
        <div className={classes.actions}>
          {props.onAssignSubClick && (
            <Can
              do={(
                permissions: OrgUserPermissions[],
                isSysAdmin: boolean,
                orgId?: string,
                forRole?: Role | null | undefined
              ) =>
                canReassignSub(
                  props.assignmentStartDate,
                  permissions,
                  isSysAdmin,
                  orgId,
                  forRole
                )
              }
            >
              <Button
                variant="text"
                onClick={props.onAssignSubClick}
                disabled={props.disableReplacementInteractions}
              >
                {t("Reassign")}
              </Button>
            </Can>
          )}
          {props.onCancelAssignment && (
            <Can
              do={(
                permissions: OrgUserPermissions[],
                isSysAdmin: boolean,
                orgId?: string,
                forRole?: Role | null | undefined
              ) =>
                canRemoveSub(
                  props.assignmentStartDate,
                  permissions,
                  isSysAdmin,
                  orgId,
                  forRole
                )
              }
            >
              <Button
                disabled={props.disableReplacementInteractions}
                className={classes.removeButton}
                variant={props.showLinkButton ? "text" : "outlined"}
                onClick={onClickRemove}
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
  container: {
    display: "flex",
    padding: theme.spacing(2),
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#ECF9F3",
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
  },
  details: {
    display: "flex",
    alignItems: "center",
  },
  name: {
    marginLeft: theme.spacing(2),
  },
  nameLabel: {
    display: "inline-block",
  },
  subText: {
    fontSize: theme.typography.pxToRem(12),
  },
  removeButton: {
    textDecoration: "uppercase",
  },
  actions: {
    width: theme.typography.pxToRem(100),
    flexWrap: "wrap",
    textAlign: "center",
  },
}));

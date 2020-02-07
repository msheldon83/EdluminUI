import * as React from "react";
import { makeStyles, Button, Typography } from "@material-ui/core";
import { AccountCircleOutlined } from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import { Vacancy } from "graphql/server-types.gen";
import { Can } from "../auth/can";
import { canRemoveSub } from "helpers/permissions";
import { OrgUserPermissions } from "ui/components/auth/types";
import { CancelAssignmentDialog } from "./cancel-assignment-dialog";
import { useState, useMemo, useCallback } from "react";
import { getGroupedVacancyDetails } from "./helpers";
import { flatMap, uniq } from "lodash-es";

type Props = {
  employeeId: string;
  employeeName: string;
  vacancies: Vacancy[];
  subText?: string;
  assignmentId?: string;
  assignmentRowVersion?: string;
  assignmentStartDate: Date;
  onCancelAssignment?: (
    assignmentId?: string,
    assignmentRowVersion?: string,
    vacancyDetailIds?: string[]
  ) => Promise<void>;
  disableReplacementInteractions?: boolean;
  showLinkButton?: boolean;
};

export const AssignedSub: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [
    cancelAssignmentDialogIsOpen,
    setCancelAssignmentDialogIsOpen,
  ] = useState(false);

  const allGroupedDetails = useMemo(() => {
    return getGroupedVacancyDetails(props.vacancies);
  }, [props.vacancies]);

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
            <Typography variant="h6">{props.employeeName}</Typography>
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
        <div>
          {props.onCancelAssignment && (
            <Can
              do={(
                permissions: OrgUserPermissions[],
                isSysAdmin: boolean,
                orgId?: string
              ) =>
                canRemoveSub(
                  props.assignmentStartDate,
                  permissions,
                  isSysAdmin,
                  orgId
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
  subText: {
    fontSize: theme.typography.pxToRem(12),
  },
  removeButton: {
    textDecoration: "uppercase",
  },
}));

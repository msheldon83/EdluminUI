import { Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import * as React from "react";
import { useMemo, useCallback } from "react";
import { GetUpcomingAssignments } from "ui/pages/sub-home/graphql/get-upcoming-assignments.gen";
import { AssignmentGroup } from "./assignment-row/assignment-group";
import { groupAssignmentsByVacancy } from "./grouping-helpers";
import { AssignmentRow } from "./assignment-row";
import { useTranslation } from "react-i18next";
import { CancelAssignment } from "ui/components/absence/graphql/cancel-assignment.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { isValid } from "date-fns";

type Props = {
  userId?: string | null;
  orgId?: string;
  startDate: Date;
  endDate: Date;
  limit?: number;
  isAdmin: boolean;
};

export const SubstituteAssignmentsListView: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const [cancelAssignment] = useMutationBundle(CancelAssignment, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const upcomingAssignments = useQueryBundle(GetUpcomingAssignments, {
    variables: {
      id: String(props.userId),
      fromDate: props.startDate,
      toDate: props.endDate,
      includeCompletedToday: true,
    },
    skip: !props.userId || !isValid(props.startDate) || !isValid(props.endDate),
  });

  const assignments = useMemo(() => {
    if (
      upcomingAssignments.state == "DONE" ||
      upcomingAssignments.state == "UPDATING"
    ) {
      return compact(
        upcomingAssignments.data.employee?.employeeAssignmentSchedule
      );
    }
    return [];
  }, [upcomingAssignments]);

  const onCancel = useCallback(
    async (
      assignmentId: string,
      rowVersion: string,
      vacancyDetailIds?: string[]
    ) => {
      await cancelAssignment({
        variables: {
          cancelRequest: {
            assignmentId,
            rowVersion,
            vacancyDetailIds,
          },
        },
      });
      await upcomingAssignments.refetch();
    },
    [cancelAssignment, upcomingAssignments]
  );

  const groupedAssignments = useMemo(
    () =>
      props.limit
        ? groupAssignmentsByVacancy(assignments).slice(0, props.limit)
        : groupAssignmentsByVacancy(assignments),
    [assignments, props.limit]
  );
  if (
    upcomingAssignments.state !== "DONE" &&
    upcomingAssignments.state !== "UPDATING"
  ) {
    return <></>;
  }

  return (
    <Grid container>
      {groupedAssignments.length < 1 ? (
        <Typography className={classes.noRecords}>{t("No records")}</Typography>
      ) : (
        groupedAssignments.map((group, i) => {
          return group.length > 1 ? (
            <AssignmentGroup
              key={i}
              vacancyDetails={group}
              onCancel={onCancel}
              className={i % 2 == 1 ? classes.shadedRow : undefined}
              isAdmin={props.isAdmin}
            />
          ) : (
            <AssignmentRow
              key={group[0].id}
              assignment={group[0]}
              onCancel={onCancel}
              className={i % 2 == 1 ? classes.shadedRow : undefined}
              isAdmin={props.isAdmin}
            />
          );
        })
      )}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  shadedRow: {
    backgroundColor: theme.customColors.lightGray,
    borderTop: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.sectionBorder
    }`,
    borderBottom: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.sectionBorder
    }`,
  },
  noRecords: {
    fontStyle: "italic",
    paddingTop: theme.typography.pxToRem(16),
  },
}));

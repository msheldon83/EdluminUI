import { Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import * as React from "react";
import { useMemo } from "react";
import { GetUpcomingAssignments } from "ui/pages/sub-home/graphql/get-upcoming-assignments.gen";
import { AssignmentGroup } from "../assignment-row/assignment-group";
import { groupAssignmentsByVacancy } from "../calendar-view/grouping-helpers";
import { AssignmentRow } from "../assignment-row";
import { useTranslation } from "react-i18next";

type Props = {
  userId?: string;
  startDate: Date;
  endDate: Date;
};

export const ListView: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const upcomingAssignments = useQueryBundle(GetUpcomingAssignments, {
    variables: {
      id: String(props.userId),
      fromDate: props.startDate,
      toDate: props.endDate,
      includeCompletedToday: true,
    },
    skip: !props.userId,
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

  const groupedAssignments = useMemo(
    () => groupAssignmentsByVacancy(assignments),
    [assignments]
  );
  if (
    upcomingAssignments.state !== "DONE" &&
    upcomingAssignments.state !== "UPDATING"
  ) {
    return <></>;
  }

  return (
    <>
      <Grid container>
        {groupedAssignments.length < 1 ? (
          <Typography className={classes.noRecords}>
            {t("No records")}
          </Typography>
        ) : (
          groupedAssignments.map((group, i) => {
            return group.length > 1 ? (
              <AssignmentGroup
                key={i}
                assignmentGroup={group}
                onCancel={() => console.log("cancel assignment")}
                className={i % 2 == 1 ? classes.shadedRow : undefined}
              />
            ) : (
              <AssignmentRow
                key={group[0].id}
                assignment={group[0]}
                onCancel={() =>
                  console.log("cancel assignment", group[0].assignment?.id)
                }
                className={i % 2 == 1 ? classes.shadedRow : undefined}
              />
            );
          })
        )}
      </Grid>
    </>
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

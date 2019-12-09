import { Grid } from "@material-ui/core";
import * as React from "react";
import { useMemo, useState } from "react";
import { AssignmentRow } from "../assignment-row";
import { AssignmentVacancyDetails } from "../types";
import { makeStyles } from "@material-ui/styles";
import { compact } from "lodash-es";
import { useQueryBundle } from "graphql/hooks";
import { GetUpcomingAssignments } from "ui/pages/sub-home/graphql/get-upcoming-assignments.gen";

type Props = {
  userId?: string;
  startDate: Date;
  endDate: Date;
};

export const ListView: React.FC<Props> = props => {
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

  if (
    upcomingAssignments.state !== "DONE" &&
    upcomingAssignments.state !== "UPDATING"
  ) {
    return <></>;
  }

  return (
    <>
      <Grid container>
        {assignments.map((a, i) => (
          <AssignmentRow
            key={a.id}
            assignment={a}
            onCancel={() => console.log("cancel assignment", a.assignment?.id)}
            className={i % 2 == 1 ? classes.shadedRow : undefined}
          />
        ))}
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  shadedRow: {
    backgroundColor: theme.customColors.lightGray,
  },
}));

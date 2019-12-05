import { Divider, makeStyles } from "@material-ui/core";
import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import * as React from "react";
import { useMemo } from "react";
import { GetUpcomingAssignments } from "../../sub-home/graphql/get-upcoming-assignments.gen";
import { AssignmentRow } from "../assignment-row";
import { NoAssignment } from "../assignment-row/no-assignment";

type Props = {
  userId?: string;
  date: Date;
};

export const NowViewingAssignmentsForDate: React.FC<Props> = props => {
  const classes = useStyles();

  const upcomingAssignments = useQueryBundle(GetUpcomingAssignments, {
    variables: {
      id: String(props.userId),
      fromDate: props.date,
      toDate: props.date,
      includeCompletedToday: true,
    },
    skip: !props.userId,
  });

  const data = useMemo(() => {
    if (
      upcomingAssignments.state == "DONE" ||
      upcomingAssignments.state == "UPDATING"
    ) {
      return compact(
        upcomingAssignments.data.employee?.employeeAssignmentSchedule
      );
    }
  }, [upcomingAssignments]);

  if (
    upcomingAssignments.state !== "DONE" &&
    upcomingAssignments.state !== "UPDATING"
  ) {
    return <></>;
  }
  console.log(
    "userId",
    props.userId,
    "on date",
    props.date,
    "jobs",
    upcomingAssignments.data.employee?.employeeAssignmentSchedule
  );
  return (
    <>
      {data && data.length > 0 ? (
        data.map((a, i) => (
          <AssignmentRow
            key={a?.id || i}
            assignment={a}
            onCancel={() => console.log("cancel assignment", a.assignment?.id)}
          />
        ))
      ) : (
        <NoAssignment date={props.date} />
      )}
      <Divider className={classes.divider} />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  divider: {
    marginBottom: theme.spacing(2),
  },
}));

import { Grid, makeStyles } from "@material-ui/core";
import { parseISO } from "date-fns";
import { startOfMonth } from "date-fns/esm";
import { groupBy } from "lodash-es";
import * as React from "react";
import { useState } from "react";
import { AssignmentCalendar } from "./assignment-calendar";
import { NowViewingAssignmentsForDate } from "./now-viewing-assignments";
import { AssignmentDetails } from "./types";


type Props = { userId?: string; assignments: AssignmentDetails[] };

export const CalendarView: React.FC<Props> = props => {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const onSelectDate = React.useCallback(
    (date: Date) => setSelectedDate(date),
    [setSelectedDate]
  );

  const groups = groupAssignmentsByMonth(props.assignments);

  return (
    <>
      <NowViewingAssignmentsForDate date={selectedDate} userId={props.userId} />
      <Grid container>
        {groups.map((group, i) => (
          <AssignmentCalendar
            key={i}
            onSelectDate={onSelectDate}
            userId={props.userId}
            date={group.month}
            assignmentDates={group.assignmentDates}
          />
        ))}
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  calendar: {
    display: "flex",
    padding: theme.spacing(1),
  },
}));

const groupAssignmentsByMonth = (assignments: AssignmentDetails[]) => {
  const groupedByMonth = Object.entries(
    groupBy(
      assignments,
      a =>
        a.assignment?.startTimeLocal &&
        startOfMonth(parseISO(a.assignment?.startTimeLocal)).toISOString()
    )
  ).map(([date, assignments]): { month: string; assignmentDates: Date[] } => {
    return {
      month: date,
      assignmentDates: assignments.map(a => parseISO(a.startDate!)),
    };
  });

  console.log(groupedByMonth);
  return groupedByMonth;
};

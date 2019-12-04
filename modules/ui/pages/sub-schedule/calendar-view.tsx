import * as React from "react";
import { Calendar } from "ui/components/form/calendar";
import { useState } from "react";
import { addMonths, addDays } from "date-fns";
import { useQueryBundle } from "graphql/hooks";
import { GetUpcomingAssignments } from "../sub-home/graphql/get-upcoming-assignments.gen";
import { AssignmentRow } from "./assignment-row";
import { compact } from "lodash-es";
import { NoAssignment } from "./assignment-row/no-assignment";
import { Divider, makeStyles, Grid } from "@material-ui/core";
import { SingleMonthCalendar } from "ui/components/form/single-month-calendar";
import { AssignmentCalendar } from "./assignment-calendar";

type Props = { userId?: string };

export const CalendarView: React.FC<Props> = props => {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = useState(addDays(new Date(), 1));

  const onSelectDate = React.useCallback(
    (date: Date) => setSelectedDate(date),
    [setSelectedDate]
  );

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addMonths(startDate, 12));
  const m2 = addMonths(startDate, 1);
  const m3 = addMonths(startDate, 2);

  const upcomingAssignments = useQueryBundle(GetUpcomingAssignments, {
    variables: {
      id: String(props.userId),
      fromDate: selectedDate,
      toDate: selectedDate,
      includeCompletedToday: true,
    },
    skip: !props.userId,
  });

  if (
    upcomingAssignments.state !== "DONE" &&
    upcomingAssignments.state !== "UPDATING"
  ) {
    return <></>;
  }

  const data = compact(
    upcomingAssignments.data.employee?.employeeAssignmentSchedule
  );
  console.log(
    "userId",
    props.userId,
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
            onCancel={() => console.log("cancel")}
          />
        ))
      ) : (
        <NoAssignment date={selectedDate} />
      )}
      <Divider className={classes.divider} />
      <Grid container>
        <AssignmentCalendar
          onSelectDate={onSelectDate}
          userId={props.userId}
          date={startDate}
        />
        <AssignmentCalendar
          onSelectDate={onSelectDate}
          userId={props.userId}
          date={m2}
        />
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  divider: {
    marginBottom: theme.spacing(2),
  },
  calendar: {
    display: "flex",
    padding: theme.spacing(1),
  },
}));

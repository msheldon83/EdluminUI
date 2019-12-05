import { Divider, Grid, makeStyles } from "@material-ui/core";
import { addMonths } from "date-fns";
import * as React from "react";
import { useState } from "react";
import { AssignmentCalendar } from "./assignment-calendar";
import { NowViewingAssignmentsForDate } from "./now-viewing-assignments";

type Props = { userId?: string };

export const CalendarView: React.FC<Props> = props => {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const onSelectDate = React.useCallback(
    (date: Date) => setSelectedDate(date),
    [setSelectedDate]
  );

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addMonths(startDate, 12));
  const m2 = addMonths(startDate, 1);
  const m3 = addMonths(startDate, 2);

  return (
    <>
      <NowViewingAssignmentsForDate date={selectedDate} userId={props.userId} />
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

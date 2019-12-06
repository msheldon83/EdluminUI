import { Grid } from "@material-ui/core";
import * as React from "react";
import { useMemo, useState } from "react";
import { AssignmentCalendar } from "./assignment-calendar";
import {
  generateEmptyDateMap,
  mergeAssignmentsByMonth,
} from "./grouping-helpers";
import { NowViewingAssignmentsForDate } from "./now-viewing-assignments";
import { AssignmentDetails } from "./types";

type Props = {
  userId?: string;
  assignments: AssignmentDetails[];
  fromDate: Date;
  toDate: Date;
};

export const CalendarView: React.FC<Props> = props => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const onSelectDate = React.useCallback(
    (date: Date) => setSelectedDate(date),
    [setSelectedDate]
  );

  const empty = useMemo(
    () => generateEmptyDateMap(props.fromDate, props.toDate),
    [props.fromDate, props.toDate]
  );
  const all = useMemo(() => mergeAssignmentsByMonth(empty, props.assignments), [
    props.assignments,
    empty,
  ]);

  return (
    <>
      <NowViewingAssignmentsForDate date={selectedDate} userId={props.userId} />
      <Grid container>
        {all.map((group, i) => (
          <AssignmentCalendar
            key={i}
            onSelectDate={onSelectDate}
            userId={props.userId}
            date={group.month}
            assignmentDates={group.dates}
            selectedDate={selectedDate}
          />
        ))}
      </Grid>
    </>
  );
};

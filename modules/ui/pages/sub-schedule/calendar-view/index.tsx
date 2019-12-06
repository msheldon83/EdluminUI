import { Grid, makeStyles } from "@material-ui/core";
import { parseISO, differenceInCalendarMonths, addMonths } from "date-fns";
import { startOfMonth } from "date-fns/esm";
import { groupBy, range, merge } from "lodash-es";
import * as React from "react";
import { useState, useMemo } from "react";
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
  const fromDate = useMemo(() => new Date(), []);
  const toDate = useMemo(() => addMonths(fromDate, 12), [fromDate]);

  const groups = fillInEmptyMonths(groupAssignmentsByMonth(props.assignments));

  const empty = generateEmptyDateMap(fromDate, toDate);
  const all = merge(empty, groups);
  console.log("Empty grouping", empty);
  console.log("all grouping", all);

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

  console.log(fillInEmptyMonths(groupedByMonth));
  return groupedByMonth;
};

interface DateObj {
  date: Date;
}

export interface DateObjGroup<T> {
  month: string;
  assignmentDates: Date[];
}

export function fillInEmptyMonths<T extends DateObj>(input: DateObjGroup<T>[]) {
  return input.length > 0
    ? input.slice(1).reduce(
        (prev: DateObjGroup<T>[], current) => {
          const back = prev[prev.length - 1];
          const diff = generateEmptyMonthsBetween(back, current);
          prev.push(...diff);
          prev.push(current);
          return prev;
        },
        [input[0]]
      )
    : [];
}

function generateEmptyMonthsBetween<T extends DateObj>(
  first: DateObjGroup<T>,
  second: DateObjGroup<T>
): DateObjGroup<T>[] {
  const firstDate = parseISO(first.month);
  const secondDate = parseISO(second.month);
  const diff = differenceInCalendarMonths(secondDate, firstDate);
  const absDiff = Math.abs(diff);
  const delta = diff > 0 ? 1 : -1;

  return absDiff > 1
    ? range(1, absDiff).map(i => {
        return {
          month: addMonths(firstDate, i * delta).toISOString(),
          assignmentDates: [],
        };
      })
    : [];
}

function generateEmptyDateMap<T extends DateObj>(
  from: Date,
  to: Date
): DateObjGroup<T>[] {
  const diff = differenceInCalendarMonths(to, from);
  const absDiff = Math.abs(diff);
  const delta = diff > 0 ? 1 : -1;

  return absDiff > 1
    ? range(0, absDiff).map(i => {
        console.log(
          "i",
          i,
          "delta",
          delta,
          "to",
          to,
          "-->",
          addMonths(to, i * delta).toISOString()
        );
        return {
          month: startOfMonth(addMonths(from, i * delta)).toISOString(),
          assignmentDates: [],
        };
      })
    : [];
}

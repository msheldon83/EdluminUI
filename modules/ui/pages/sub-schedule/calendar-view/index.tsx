import { Grid } from "@material-ui/core";
import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import * as React from "react";
import { useMemo, useState } from "react";
import { GetAssignmentDatesForEmployee } from "../graphql/get-assignments-dates-for-employee.gen";
import { AssignmentCalendar } from "./assignment-calendar";
import {
  generateEmptyDateMap,
  mergeAssignmentDatesByMonth,
} from "./grouping-helpers";
import { NowViewingAssignmentsForDate } from "./now-viewing-assignments";

type Props = {
  userId?: string;
  fromDate: Date;
  toDate: Date;
};

export const CalendarView: React.FC<Props> = props => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const onSelectDate = React.useCallback(
    (date: Date) => setSelectedDate(date),
    [setSelectedDate]
  );

  const upcomingAssignmentDates = useQueryBundle(
    GetAssignmentDatesForEmployee,
    {
      variables: {
        id: String(props.userId),
        fromDate: props.fromDate,
        toDate: props.toDate,
        includeCompletedToday: true,
      },
      skip: !props.userId,
    }
  );
  const assignmentDates = useMemo(() => {
    if (
      upcomingAssignmentDates.state == "DONE" ||
      upcomingAssignmentDates.state == "UPDATING"
    ) {
      return compact(
        upcomingAssignmentDates.data.employee?.employeeAssignmentSchedule
      );
    }
    return [];
  }, [upcomingAssignmentDates]);

  const empty = useMemo(
    () => generateEmptyDateMap(props.fromDate, props.toDate),
    [props.fromDate, props.toDate]
  );

  const all = useMemo(() => {
    return mergeAssignmentDatesByMonth(empty, assignmentDates);
  }, [empty, assignmentDates]);

  if (
    upcomingAssignmentDates.state !== "DONE" &&
    upcomingAssignmentDates.state !== "UPDATING"
  ) {
    return <></>;
  }

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

import { Grid } from "@material-ui/core";
import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import * as React from "react";
import { useMemo } from "react";
import { GetAssignmentDatesForSubstitute } from "../graphql/get-assignments-dates-for-substitute.gen";
import { AssignmentCalendar } from "./assignment-calendar";
import {
  generateEmptyDateMap,
  mergeAssignmentDatesByMonth,
} from "../grouping-helpers";

type Props = {
  userId?: string;
  orgId?: string;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  fromDate: Date;
  toDate: Date;
};

export const SubstituteAssignmentsCalendarView: React.FC<Props> = props => {
  const upcomingAssignmentDates = useQueryBundle(
    GetAssignmentDatesForSubstitute,
    {
      variables: {
        id: String(props.userId),
        organizationId: props.orgId ?? null,
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
    <Grid container>
      {all.map((group, i) => (
        <AssignmentCalendar
          key={i}
          onSelectDate={props.onSelectDate}
          date={group.month}
          assignmentDates={group.dates}
          selectedDate={props.selectedDate}
        />
      ))}
    </Grid>
  );
};

import { makeStyles } from "@material-ui/core";
import * as DateFns from "date-fns";
import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import * as React from "react";
import { SingleMonthCalendar } from "ui/components/form/single-month-calendar";
import { GetAssignmentDatesForEmployee } from "./graphql/get-assignments-for-employee.gen";

type Props = {
  userId?: string;
  date: Date;
  onSelectDate: (date: Date) => void;
};

export const AssignmentCalendar: React.FC<Props> = props => {
  const classes = useStyles();

  const firstDay = DateFns.startOfMonth(props.date);
  const lastDay = DateFns.lastDayOfMonth(props.date);

  const assignmentsForMonth = useQueryBundle(GetAssignmentDatesForEmployee, {
    variables: {
      id: String(props.userId),
      fromDate: firstDay,
      toDate: lastDay,
      includeCompletedToday: true,
    },
    skip: !props.userId,
  });

  if (
    assignmentsForMonth.state !== "UPDATING" &&
    assignmentsForMonth.state !== "DONE"
  ) {
    return <></>;
  }

  // TODO these should be memoized
  const data = compact(
    assignmentsForMonth.data.employee?.employeeAssignmentSchedule
  );
  const assignmentDates: Date[] = data.map(d => DateFns.parseISO(d.startDate));

  return (
    <div className={classes.calendar}>
      <SingleMonthCalendar month={props.date} selectedDates={assignmentDates} />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  calendar: {
    display: "flex",
    padding: theme.spacing(1),
  },
}));

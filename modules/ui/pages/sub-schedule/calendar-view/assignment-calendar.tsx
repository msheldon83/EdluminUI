import { makeStyles } from "@material-ui/core";
import * as DateFns from "date-fns";
import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import * as React from "react";
import { SingleMonthCalendar } from "ui/components/form/single-month-calendar";
import { GetAssignmentDatesForEmployee } from "../graphql/get-assignments-dates-for-employee.gen";
import { useMemo } from "react";

type Props = {
  userId?: string;
  date: string;
  onSelectDate: (date: Date) => void;
  assignmentDates: Date[];
};

export const AssignmentCalendar: React.FC<Props> = props => {
  const classes = useStyles();

  const assignmentDates = useMemo(
    () =>
      props.assignmentDates.map(d => ({
        date: d,
        buttonProps: { className: classes.assignment },
      })),
    [props.assignmentDates, classes.assignment]
  );

  return (
    <div className={classes.calendar}>
      <SingleMonthCalendar
        currentMonth={DateFns.parseISO(props.date)}
        customDates={assignmentDates}
        onSelectDate={props.onSelectDate}
      />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  calendar: {
    display: "flex",
    padding: theme.spacing(1),
  },
  assignment: {
    backgroundColor: theme.palette.primary.main,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: theme.customColors.white,
    },
  },
}));

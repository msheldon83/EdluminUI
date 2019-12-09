import { Grid } from "@material-ui/core";
import * as React from "react";
import { useMemo, useState } from "react";
import { AssignmentRow } from "../assignment-row";
import { AssignmentDetails } from "../types";
import { makeStyles } from "@material-ui/styles";

type Props = {
  userId?: string;
  assignments: AssignmentDetails[];
  // fromDate: Date;
  // toDate: Date;
};

export const ListView: React.FC<Props> = props => {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const onSelectDate = React.useCallback(
    (date: Date) => setSelectedDate(date),
    [setSelectedDate]
  );

  // const empty = useMemo(
  //   () => generateEmptyDateMap(props.fromDate, props.toDate),
  //   [props.fromDate, props.toDate]
  // );
  // const all = useMemo(() => mergeAssignmentsByMonth(empty, props.assignments), [
  //   props.assignments,
  //   empty,
  // ]);

  return (
    <>
      <Grid container>
        {props.assignments.map((a, i) => (
          <AssignmentRow
            key={a.id}
            assignment={a}
            onCancel={() => console.log("cancel assignment", a.assignment?.id)}
            className={i % 2 == 1 ? classes.shadedRow : undefined}
          />
        ))}
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  shadedRow: {
    backgroundColor: theme.customColors.lightGray,
  },
}));

import * as React from "react";
import { Calendar } from "ui/components/form/calendar";
import { useState } from "react";
import { addMonths, addDays } from "date-fns";
import { useQueryBundle } from "graphql/hooks";
import { GetUpcomingAssignments } from "../sub-home/graphql/get-upcoming-assignments.gen";
import { AssignmentRow } from "./assignment-row";
import { compact } from "lodash-es";
import { NoAssignment } from "./assignment-row/no-assignment";

type Props = { userId?: string };

export const CalendarView: React.FC<Props> = props => {
  const [selectedDate, setSelectedDate] = useState(addDays(new Date(), 0));

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addMonths(startDate, 12));

  const upcomingAssignments = useQueryBundle(GetUpcomingAssignments, {
    variables: {
      id: String(props.userId),
      fromDate: selectedDate,
      toDate: selectedDate,
      includeCompletedToday: true,
    },
    skip: !props.userId,
  });

  if (upcomingAssignments.state !== "DONE") {
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
      tomorrow
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
      <Calendar startDate={startDate} />
    </>
  );
};

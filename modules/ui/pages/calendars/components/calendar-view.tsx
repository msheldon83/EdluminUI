import * as React from "react";
import { CalendarChange } from "graphql/server-types.gen";
import { Grid } from "@material-ui/core";
import { CalednarChangeMonthCalendar } from "./calendar-change-month-calendar";
import {
  generateEmptyDateMap,
  mergeAssignmentDatesByMonth,
  DateGroupByMonth,
} from "ui/components/substitutes/grouping-helpers";
import { parseISO } from "date-fns";
import { startOfMonth } from "date-fns/esm";
import { groupBy, range } from "lodash-es";

type Props = {
  calandarChangeDates: any[];
  fromDate: Date;
  toDate: Date;
};
export const CalendarView: React.FC<Props> = props => {
  /*need to group all dates by month then iterate over each and render a calendar-change-month-calendar*/

  const empty = generateEmptyDateMap(props.fromDate, props.toDate);

  const mergeAssignmentDatesByMonth = (
    emptyMap: DateGroupByMonth[],
    calandarChangeDates: CalendarChange[]
  ) => {
    const all = emptyMap;
    Object.entries(
      groupBy(
        calandarChangeDates,
        c =>
          c.startDate.startTimeLocal &&
          startOfMonth(parseISO(c.startDate)).toISOString()
      )
    ).map(([date, calandarChangeDates]) => {
      const month = all.find(e => e.month === date);
      if (!month) return;
      month.dates = calandarChangeDates.map(a => parseISO(a.startDate));
    });

    return all;
  };

  const groupedDates = mergeAssignmentDatesByMonth(
    empty,
    props.calandarChangeDates
  );
  console.log(groupedDates);

  return (
    <>
      <Grid container>
        {groupedDates.map((group, i) => (
          <CalednarChangeMonthCalendar
            key={i}
            onSelectDate={props.onSelectDate}
            date={group.month}
            calendarChangeDates={group.dates}
            selectedDate={props.selectedDate}
          />
        ))}
      </Grid>
    </>
  );
};

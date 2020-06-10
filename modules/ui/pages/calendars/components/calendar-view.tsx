import * as React from "react";
import { CalendarChange } from "graphql/server-types.gen";
import { Grid } from "@material-ui/core";
import { CalendarChangeMonthCalendar } from "./calendar-change-month-calendar";
import {
  generateEmptyDateMap,
  DateGroupByMonth,
} from "ui/components/substitutes/grouping-helpers";
import { startOfMonth } from "date-fns/esm";
import { parseISO, eachDayOfInterval, format } from "date-fns";
import { groupBy } from "lodash-es";
import { CalendarEvent } from "../types";

type Props = {
  calandarChangeDates: any[];
  fromDate: Date;
  toDate: Date;
  setSelectedCalendarChanges: (cc: CalendarEvent) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};
export const CalendarView: React.FC<Props> = props => {
  /*need to group all dates by month then iterate over each and render a calendar-change-month-calendar*/

  const empty = generateEmptyDateMap(props.fromDate, props.toDate);

  const onSelectDate = (date: Date) => {
    const calendarChanges = props.calandarChangeDates.find(cc => {
      return date >= parseISO(cc.startDate) && date <= parseISO(cc.endDate);
    });
    props.setSelectedCalendarChanges(calendarChanges);
    props.setSelectedDate(date);
  };

  const mergeChangeDatesByMonth = (
    emptyMap: DateGroupByMonth[],
    calandarChangeDates: CalendarChange[]
  ) => {
    const all = emptyMap;
    Object.entries(
      groupBy(
        calandarChangeDates,
        c => c.startDate && startOfMonth(parseISO(c.startDate)).toISOString()
      )
    ).map(([date, calandarChangeDates]) => {
      const month = all.find(e => e.month === date);
      if (!month) return;
      month.dates = calandarChangeDates.map(a => parseISO(a.startDate));
    });

    return all;
  };

  // first unconsolidate dates if any calendar change goes for more then one day
  const unConsolidatedCalandarChangeDates: any[] = [];
  props.calandarChangeDates.forEach(e => {
    if (e.startDate === e.endDate) {
      unConsolidatedCalandarChangeDates.push(e);
    } else {
      const days = eachDayOfInterval({
        start: parseISO(e.startDate),
        end: parseISO(e.endDate),
      });
      days.forEach(d => {
        const cc = { ...e };
        cc.startDate = format(d, "yyyy-MM-dd");
        cc.endDate = format(d, "yyyy-MM-dd");
        unConsolidatedCalandarChangeDates.push(cc);
      });
    }
  });

  if (
    !unConsolidatedCalandarChangeDates.find(
      c => c.startDate === format(props.selectedDate, "yyyy-MM-dd")
    )
  ) {
    unConsolidatedCalandarChangeDates.push({
      startDate: format(props.selectedDate, "yyyy-MM-dd"),
      endDate: format(props.selectedDate, "yyyy-MM-dd"),
      affectsAllContracts: true,
    });
  }

  const groupedDates = mergeChangeDatesByMonth(
    empty,
    unConsolidatedCalandarChangeDates
  );

  return (
    <>
      <Grid container>
        {groupedDates.map((group, i) => (
          <CalendarChangeMonthCalendar
            key={i}
            onSelectDate={onSelectDate}
            date={group.month}
            calendarChangeDates={group.dates}
            selectedDate={props.selectedDate}
          />
        ))}
      </Grid>
    </>
  );
};

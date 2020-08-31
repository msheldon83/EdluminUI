import * as React from "react";
import { CalendarChange, CalendarDayType } from "graphql/server-types.gen";
import { Grid } from "@material-ui/core";
import { CalendarChangeMonthCalendar } from "./calendar-change-month-calendar";
import {
  generateMonths,
  DateGroupByMonth,
} from "ui/components/substitutes/grouping-helpers";
import { startOfMonth, startOfDay } from "date-fns/esm";
import { parseISO, eachDayOfInterval, format } from "date-fns";
import { compact, groupBy } from "lodash-es";
import { CalendarEvent, CalendarChangeDate } from "../types";

type Props = {
  calandarChangeDates: CalendarChange[];
  fromDate: Date;
  toDate: Date;
  setSelectedCalendarChanges: (cc: CalendarEvent[]) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};
export const CalendarView: React.FC<Props> = props => {
  /*need to group all dates by month then iterate over each and render a calendar-change-month-calendar*/

  const monthList = generateMonths(props.fromDate, props.toDate);

  const onSelectDate = (date: Date) => {
    const calendarChanges = props.calandarChangeDates.filter(cc => {
      return date >= parseISO(cc.startDate) && date <= parseISO(cc.endDate);
    });

    props.setSelectedCalendarChanges(calendarChanges!);
    props.setSelectedDate(date);
  };

  const mergeChangeDatesByMonth = (
    monthList: string[],
    calandarChangeDates: (Pick<
      CalendarChange,
      "startDate" | "endDate" | "affectsAllContracts"
    > & { dayType?: CalendarDayType })[]
  ): { month: string; dates: CalendarChangeDate[] }[] => {
    const groupedDates = groupBy(
      calandarChangeDates,
      c => c.startDate && startOfMonth(parseISO(c.startDate)).toISOString()
    );

    return monthList.map(month => ({
      month,
      dates:
        month in groupedDates
          ? Object.entries(
              groupBy(groupedDates[month], a =>
                startOfDay(parseISO(a.startDate)).toISOString()
              )
            ).map(
              ([day, dates]): CalendarChangeDate => ({
                date: parseISO(day),
                isClosed: dates.some(
                  d =>
                    d.dayType == CalendarDayType.NonWorkDay ||
                    d.dayType == CalendarDayType.CancelledDay
                ),
                isModified: dates.some(
                  d => d.dayType == CalendarDayType.InstructionalDay
                ),
                isInservice: dates.some(
                  d => d.dayType == CalendarDayType.TeacherWorkDay
                ),
              })
            )
          : [],
    }));
  };

  // first unconsolidate dates if any calendar change goes for more then one day
  const unConsolidatedCalandarChangeDates: (Pick<
    CalendarChange,
    "startDate" | "endDate" | "affectsAllContracts"
  > & {
    dayType?: CalendarDayType;
  })[] = [];
  props.calandarChangeDates.forEach(e => {
    if (e.startDate === e.endDate) {
      unConsolidatedCalandarChangeDates.push({
        ...e,
        dayType: e.calendarChangeReason?.calendarDayTypeId ?? undefined,
      });
    } else {
      const days = eachDayOfInterval({
        start: parseISO(e.startDate),
        end: parseISO(e.endDate),
      });
      days.forEach(d => {
        const cc = {
          ...e,
          dayType: e.calendarChangeReason?.calendarDayTypeId ?? undefined,
        };
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
    monthList,
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

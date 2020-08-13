import {
  addMonths,
  differenceInCalendarMonths,
  parseISO,
  isLastDayOfMonth,
  addDays,
  getDay,
} from "date-fns";
import { startOfMonth } from "date-fns/esm";
import { groupBy, range } from "lodash-es";
import { AssignmentVacancyDetails } from "../../pages/sub-schedule/types";

export interface DateGroupByMonth {
  month: string;
  dates: Date[];
}

export const generateMonths = (from: Date, to: Date): string[] => {
  const toDate = isLastDayOfMonth(to) ? addDays(to, 1) : to;
  const diff = differenceInCalendarMonths(toDate, from);
  const absDiff = Math.abs(diff);
  const delta = diff > 0 ? 1 : -1;

  return absDiff > 1
    ? range(0, absDiff).map(i =>
        startOfMonth(addMonths(from, i * delta)).toISOString()
      )
    : [];
};
export type AssignmentVacancyTimeDetails = {
  id?: string;
  startDate?: string;
};

export const mergeDatesByMonth = (
  monthList: string[],
  dates: Date[]
): DateGroupByMonth[] => {
  const groupedDates = groupBy(dates, d => startOfMonth(d).toISOString());
  return monthList.map(month => ({
    month,
    dates: month in groupedDates ? groupedDates[month] : [],
  }));
};

export const groupAssignmentsByVacancy = (
  assignments: AssignmentVacancyDetails[]
) => {
  return Object.entries(groupBy(assignments, a => a.vacancy?.id))
    .map(([index, value]) => value)
    .sort((a, b) =>
      (a[0].startTimeLocal ?? "").localeCompare(b[0].startTimeLocal ?? "")
    );
};

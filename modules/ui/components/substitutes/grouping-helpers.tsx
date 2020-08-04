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

export function generateMonths(from: Date, to: Date): string[] {
  const toDate = isLastDayOfMonth(to) ? addDays(to, 1) : to;
  const diff = differenceInCalendarMonths(toDate, from);
  const absDiff = Math.abs(diff);
  const delta = diff > 0 ? 1 : -1;

  return absDiff > 1
    ? range(0, absDiff).map(i =>
        startOfMonth(addMonths(from, i * delta)).toISOString()
      )
    : [];
}

export const generateEmptyDateMap = (
  from: Date,
  to: Date
): DateGroupByMonth[] =>
  generateMonths(from, to).map(month => ({ month, dates: [] }));

export type AssignmentVacancyTimeDetails = {
  id?: string;
  startDate?: string;
};

export const mergeAssignmentDatesByMonth = (
  emptyMap: DateGroupByMonth[],
  vacancyDetails: AssignmentVacancyTimeDetails[]
) => {
  const all = emptyMap;
  Object.entries(
    groupBy(
      vacancyDetails,
      a => a.startDate && startOfMonth(parseISO(a.startDate)).toISOString()
    )
  ).map(([date, vacancyDetails]) => {
    const month = all.find(e => e.month === date);
    if (!month) return;
    month.dates = vacancyDetails.map(a => parseISO(a.startDate!));
  });

  return all;
};

export const mergeUnavailableDatesByMonth = (
  emptyMap: DateGroupByMonth[],
  exceptions: string[]
) => {
  const all = emptyMap;
  Object.entries(
    groupBy(
      exceptions,
      date => date && startOfMonth(parseISO(date)).toISOString()
    )
  ).map(([date, exceptions]) => {
    const month = all.find(e => e.month === date);
    if (!month) return;
    month.dates = exceptions.map(date => parseISO(date));
  });

  return all;
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

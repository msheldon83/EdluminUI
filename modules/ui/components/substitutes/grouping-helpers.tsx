import { addMonths, differenceInCalendarMonths, parseISO } from "date-fns";
import { startOfMonth } from "date-fns/esm";
import { groupBy, range } from "lodash-es";
import { AssignmentVacancyDetails } from "../../pages/sub-schedule/types";

export interface DateGroupByMonth {
  month: string;
  dates: Date[];
}

export function generateEmptyDateMap(from: Date, to: Date): DateGroupByMonth[] {
  const diff = differenceInCalendarMonths(to, from);
  const absDiff = Math.abs(diff);
  const delta = diff > 0 ? 1 : -1;

  return absDiff > 1
    ? range(0, absDiff).map(i => ({
        month: startOfMonth(addMonths(from, i * delta)).toISOString(),
        dates: [],
      }))
    : [];
}

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
      a =>
        a.startDate &&
        startOfMonth(parseISO(a.startDate)).toISOString()
    )
  ).map(([date, vacancyDetails]) => {
    const month = all.find(e => e.month === date);
    if (!month) return;
    month.dates = vacancyDetails.map(a => parseISO(a.startDate!));
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

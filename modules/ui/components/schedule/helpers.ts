import { getBeginningAndEndOfSchoolYear } from "../helpers";
import { parseISO, addMonths, isValid, endOfMonth, addDays } from "date-fns";

export const numberOfMonthsInSchoolYear = 12;
export const createYearOption = (startDate: Date) => {
  const [startOfSchoolYear, endOfSchoolYear] = getBeginningAndEndOfSchoolYear(
    startDate
  );

  return {
    label: `${startOfSchoolYear.getFullYear()}-${endOfSchoolYear.getFullYear()}`,
    value: dateRangeString(startOfSchoolYear, endOfSchoolYear),
  };
};

export const dateRangeString = (startDate: Date, endDate: Date): string =>
  [startDate.toISOString(), endDate.toISOString()].join(",");

export const stringToStartAndEndDate = (
  dateString: string
): { startDate: Date; endDate: Date } | null => {
  const dates = dateString.split(",");
  if (dates.length < 2) return null;

  const startDate = parseISO(dates[0]);
  const endDate = parseISO(dates[1]);

  if (!isValid(startDate) || !isValid(endDate)) return null;
  return { startDate, endDate };
};

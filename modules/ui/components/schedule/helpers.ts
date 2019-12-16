import { getBeginningOfSchoolYear } from "../helpers";
import { parseISO, addMonths, isValid, endOfMonth, addDays } from "date-fns";

export const numberOfMonthsInSchoolYear = 12;
export const createYearOption = (startDate: Date) => {
  const startOfSchoolYear = getBeginningOfSchoolYear(startDate);

  /* ml 12-16-2019 Ran into an interesting bug where going to the
     end of the month (Dec 16 2019 23:59:59) will fail for leap
     years (presumably). This is because, in part, the way that
     graphql translates Dates into DateTimes. Subtracting one day
     to give an extra buffer. */
  const endDate = addDays(
    addMonths(startOfSchoolYear, numberOfMonthsInSchoolYear),
    -1
  );

  return {
    label: `${startDate.getFullYear()}-${endDate.getFullYear()}`,
    value: dateRangeString(startOfSchoolYear, endDate),
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

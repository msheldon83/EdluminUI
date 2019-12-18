import { getContiguousDateIntervals } from "helpers/date";
import { DisabledDate } from "helpers/absence/computeDisabledDates";
import { format } from "date-fns";

export const getAbsenceDateRangeDisplayText = (
  startDate: Date | null,
  endDate: Date | null,
  disabledDates?: DisabledDate[]
): string | null => {
  if (!startDate || !endDate) {
    return null;
  }

  const intervals = getContiguousDateIntervals(
    startDate,
    endDate,
    disabledDates ? disabledDates.map(d => d.date) : undefined
  );

  if (intervals.length === 0) {
    return null;
  }

  const monthFormat = "MMMM";
  const yearFormat = "yyyy";
  let currentMonth = format(intervals[0].start, monthFormat);
  let currentYear = format(intervals[0].start, "yyyy");
  let overallDateRangeDisplay = `${currentMonth} `;
  intervals.forEach(interval => {
    if (currentYear !== format(interval.end, yearFormat)) {
      // Current interval crosses a year boundary
      overallDateRangeDisplay += `${format(
        interval.start,
        "d, yyyy"
      )} - ${format(interval.end, "MMMM d")},`;
      currentYear = format(interval.end, yearFormat);
      currentMonth = format(interval.end, monthFormat);
    } else if (currentMonth !== format(interval.end, monthFormat)) {
      // Current interval crosses a month boundary
      overallDateRangeDisplay += `${format(interval.start, "d")} - ${format(
        interval.end,
        "MMMM d"
      )},`;
      currentMonth = format(interval.end, monthFormat);
    } else if (interval.start.getDate() === interval.end.getDate()) {
      overallDateRangeDisplay += `${format(interval.start, "d")},`;
    } else {
      overallDateRangeDisplay += `${format(interval.start, "d")}-${format(
        interval.end,
        "d"
      )},`;
    }
  });

  overallDateRangeDisplay += ` ${currentYear}`;
  return overallDateRangeDisplay;
};

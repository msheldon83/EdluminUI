import { getContiguousDateIntervals } from "helpers/date";
import { format } from "date-fns";

export const getAbsenceDateRangeDisplayText = (
  allDates: Date[],
  disabledDates?: Date[]
): string | null => {
  if (allDates.length === 0) {
    return null;
  }

  const intervals = getContiguousDateIntervals(allDates, disabledDates);

  if (intervals.length === 0) {
    return null;
  }

  const monthFormat = "MMMM";
  let currentMonth = format(intervals[0].start, monthFormat);
  let currentYear = intervals[0].start.getFullYear();
  let overallDateRangeDisplay = `${currentMonth} `;
  intervals.forEach(interval => {
    if (currentYear !== interval.start.getFullYear()) {
      // New interval crosses over into a new Year from the previous interval
      overallDateRangeDisplay += ` ${currentYear} - ${format(
        interval.start,
        `${monthFormat}`
      )} `;
      currentYear = interval.start.getFullYear();
      currentMonth = format(interval.start, monthFormat);
    }

    if (currentYear !== interval.end.getFullYear()) {
      // Current interval crosses a year boundary
      overallDateRangeDisplay += `${format(
        interval.start,
        `d`
      )}, ${currentYear} - ${format(interval.end, `${monthFormat} d`)},`;
      currentYear = interval.end.getFullYear();
      currentMonth = format(interval.end, monthFormat);
    } else if (currentMonth !== format(interval.end, monthFormat)) {
      // Current interval crosses a month boundary
      overallDateRangeDisplay += `${format(interval.start, "d")} - ${format(
        interval.end,
        `${monthFormat} d`
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

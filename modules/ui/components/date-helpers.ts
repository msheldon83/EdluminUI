import { getContiguousDateIntervals, DateInterval } from "helpers/date";
import { format, getISOWeek, parseISO } from "date-fns";

export const getIntervalDisplayText = (
  intervals: DateInterval[],
  monthFormat = "MMMM",
  includeYear = true
) => {
  if (intervals.length === 0) {
    return null;
  }

  let currentMonth = format(intervals[0].start, monthFormat);
  let currentYear = intervals[0].start.getFullYear();
  let overallDateRangeDisplay = `${currentMonth} `;

  intervals.forEach(interval => {
    if (includeYear && currentYear !== interval.start.getFullYear()) {
      // New interval crosses over into a new Year from the previous interval
      overallDateRangeDisplay += ` ${currentYear} - ${format(
        interval.start,
        `${monthFormat}`
      )} `;
      currentYear = interval.start.getFullYear();
      currentMonth = format(interval.start, monthFormat);
    }

    if (currentMonth !== format(interval.start, monthFormat)) {
      // New interval crosses into a new Month from the previous interval
      overallDateRangeDisplay += ` ${format(
        interval.start,
        `${monthFormat}`
      )} `;

      currentMonth = format(interval.start, monthFormat);
    }

    if (includeYear && currentYear !== interval.end.getFullYear()) {
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
      currentMonth = format(interval.end, monthFormat);
    } else {
      overallDateRangeDisplay += `${format(interval.start, "d")}-${format(
        interval.end,
        "d"
      )},`;
      currentMonth = format(interval.end, monthFormat);
    }
  });

  if (includeYear) {
    overallDateRangeDisplay += ` ${currentYear}`;
  }

  // Remove trailing comma from the date range display text if there is one
  if (overallDateRangeDisplay.endsWith(",")) {
    overallDateRangeDisplay = overallDateRangeDisplay.substring(
      0,
      overallDateRangeDisplay.length - 1
    );
  }

  return overallDateRangeDisplay;
};

export const getDateRangeDisplayText = (
  allDates: Date[],
  disabledDates?: Date[]
): string | null => {
  if (allDates.length === 0) {
    return null;
  }

  const intervals = getContiguousDateIntervals(allDates, disabledDates);
  return getIntervalDisplayText(intervals);
};

export const getIntervalDisplayTextWithDayOfWeek = (
  intervals: DateInterval[]
) => {
  if (intervals.length === 0) {
    return null;
  }

  const monthFormat = "MMM";
  const dayOfWeekFormat = "EEE";
  let currentMonth = format(intervals[0].start, monthFormat);
  let currentYear = intervals[0].start.getFullYear();
  let overallDateRangeDisplay = `${currentMonth} `;
  let overallDayOfWeekDisplay = "";
  let showDays = intervals.length === 1;

  intervals.forEach(interval => {
    if (currentYear !== interval.start.getFullYear()) {
      // New interval crosses over into a new Year from the previous interval
      overallDateRangeDisplay += `${format(interval.start, `${monthFormat}`)} `;
      currentYear = interval.start.getFullYear();
      currentMonth = format(interval.start, monthFormat);
    }
    if (currentMonth !== format(interval.start, monthFormat)) {
      // New interval crosses into a new Month from the previous interval
      overallDateRangeDisplay += `${format(interval.start, `${monthFormat}`)} `;
      if (getISOWeek(interval.start) !== getISOWeek(interval.end)) {
        showDays = false;
      }

      currentMonth = format(interval.start, monthFormat);
    }

    if (currentYear !== interval.end.getFullYear()) {
      // Current interval crosses a year boundary
      overallDateRangeDisplay += `${format(interval.start, `d`)} - ${format(
        interval.end,
        `${monthFormat} d`
      )}, `;
      overallDayOfWeekDisplay += `${format(
        interval.start,
        dayOfWeekFormat
      )}-${format(interval.end, dayOfWeekFormat)}, `;
      if (getISOWeek(interval.start) !== getISOWeek(interval.end)) {
        showDays = false;
      }

      currentYear = interval.end.getFullYear();
      currentMonth = format(interval.end, monthFormat);
    } else if (currentMonth !== format(interval.end, monthFormat)) {
      // Current interval crosses a month boundary
      overallDateRangeDisplay += `${format(interval.start, "d")} - ${format(
        interval.end,
        `${monthFormat} d`
      )}, `;
      overallDayOfWeekDisplay += `${format(
        interval.start,
        dayOfWeekFormat
      )}-${format(interval.end, dayOfWeekFormat)}, `;

      if (getISOWeek(interval.start) !== getISOWeek(interval.end)) {
        showDays = false;
      }

      currentMonth = format(interval.end, monthFormat);
    } else if (interval.start.getDate() === interval.end.getDate()) {
      overallDateRangeDisplay += `${format(interval.start, "d")}, `;
      overallDayOfWeekDisplay += `${format(interval.start, dayOfWeekFormat)}, `;
      currentMonth = format(interval.end, monthFormat);
    } else {
      overallDateRangeDisplay += `${format(interval.start, "d")}-${format(
        interval.end,
        "d"
      )}, `;
      if (getISOWeek(interval.start) !== getISOWeek(interval.end)) {
        showDays = false;
      }

      overallDayOfWeekDisplay += `${format(
        interval.start,
        dayOfWeekFormat
      )}-${format(interval.end, dayOfWeekFormat)}, `;
      currentMonth = format(interval.end, monthFormat);
    }
  });

  // Remove trailing comma from the date range display text if there is one
  if (overallDateRangeDisplay.endsWith(", ")) {
    overallDateRangeDisplay = overallDateRangeDisplay.substring(
      0,
      overallDateRangeDisplay.length - 2
    );
  } else if (overallDateRangeDisplay.endsWith(",")) {
    overallDateRangeDisplay = overallDateRangeDisplay.substring(
      0,
      overallDateRangeDisplay.length - 1
    );
  }

  return showDays
    ? `${overallDayOfWeekDisplay}${overallDateRangeDisplay}`
    : overallDateRangeDisplay;
};

export const getDateRangeDisplayTextWithDayOfWeek = (
  allDates: Date[],
  disabledDates?: Date[]
): string | null => {
  if (allDates.length === 0) {
    return null;
  }

  const intervals = getContiguousDateIntervals(allDates, disabledDates);
  return getIntervalDisplayTextWithDayOfWeek(intervals);
};

export const getDateRangeDisplayTextWithDayOfWeekForContiguousDates = (
  allDates: Date[],
  disabledDates?: Date[]
): string | null => {
  const intervals = getContiguousDateIntervals(allDates, disabledDates);
  if (intervals.length > 1) {
    return getIntervalDisplayText(intervals);
  } else {
    return getIntervalDisplayTextWithDayOfWeek(intervals);
  }
};

export const getDateRangeDisplayTextWithOutDayOfWeekForContiguousDates = (
  allDates: Date[],
  disabledDates?: Date[],
  includeYear = true
): string | null => {
  const intervals = getContiguousDateIntervals(allDates, disabledDates);
  return getIntervalDisplayText(intervals, undefined, includeYear);
};

export const getBasicDateRangeDisplayText = (
  allDates: Date[],
  disabledDates?: Date[],
  monthFormat = "MMMM",
  includeYear = true
) => {
  const intervals = getContiguousDateIntervals(allDates, disabledDates);
  return getIntervalDisplayText(intervals, monthFormat, includeYear);
};

export const parseAndFormat = (isoDate: string | null, formatStr: string) => {
  if(!isoDate) return isoDate;
  return format(parseISO(isoDate), formatStr);
}

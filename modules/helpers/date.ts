import {
  isAfter,
  isValid,
  parseISO,
  isWithinInterval,
  isEqual,
  isDate,
  format,
  formatDistance,
  addDays,
  startOfDay,
  formatRelative,
  isYesterday,
  isToday,
  isTomorrow,
  differenceInCalendarDays,
  isSameDay,
  differenceInMinutes,
  max,
  min,
} from "date-fns";
import { useMemo } from "react";
import { differenceWith } from "lodash-es";

export type PolymorphicDateType = Date | string | undefined;
export type DateInterval = {
  start: Date;
  end: Date;
};

export const tryDateFromString = (date: string | undefined) => {
  if (date === undefined) {
    return undefined;
  }

  try {
    return new Date(date);
  } catch (e) {
    return undefined;
  }
};

export const tryDifferenceInMinutes = (
  endDate: Date | undefined,
  startDate: Date | undefined
) => {
  if (!endDate || !startDate) {
    return 0;
  }

  return differenceInMinutes(endDate, startDate);
};

export const isAfterDate = (
  date1: PolymorphicDateType,
  date2: PolymorphicDateType
) => {
  // These statements look like this to make TypeScript happy :/
  if (typeof date1 === "undefined") {
    return false;
  }

  if (typeof date2 === "undefined") {
    return false;
  }

  if (typeof date2 === "string" || typeof date1 === "string") {
    return false;
  }

  return isAfter(date1, date2);
};

export const formatIsoDateIfPossible = (
  date: any,
  formatDefinition: string
) => {
  if (!date) {
    return "";
  }

  const parsedDate = parseISO(date);
  if (!isValid(parsedDate)) {
    return date;
  }

  return formatDateIfPossible(parsedDate, formatDefinition);
};

export const formatDateIfPossible = (
  date: PolymorphicDateType,
  formatDefinition: string
) => {
  if (!date) {
    return "";
  }

  if (typeof date === "string") {
    return date;
  }

  if (!isValid(date)) {
    return date;
  }

  return format(date, formatDefinition);
};

export const areDatesEqual = (
  start: PolymorphicDateType,
  end: PolymorphicDateType
) => {
  // These statements look like this to make TypeScript happy :/
  if (typeof start === "undefined" || typeof end === "undefined") {
    return false;
  }

  if (typeof start === "string" || typeof end === "string") {
    return false;
  }

  return isEqual(start, end);
};

export const inDateInterval = (
  day: Date | undefined,
  { start, end }: { start: PolymorphicDateType; end: PolymorphicDateType }
): boolean => {
  // These statements look like this to make TypeScript happy :/
  if (
    typeof day === "undefined" ||
    typeof start === "undefined" ||
    typeof end === "undefined"
  ) {
    return false;
  }

  if (typeof start === "string" || typeof end === "string") {
    return false;
  }

  return isWithinInterval(day, { start, end });
};

export const getDateRangeDisplayText = (
  startDate: Date | null,
  endDate: Date | null
): string | null => {
  if (!startDate || !endDate) {
    return null;
  }

  // Same date
  if (
    startDate.getDate() === endDate.getDate() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  ) {
    return format(startDate, "MMMM d, yyyy");
  }

  // Same Month
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${format(startDate, "MMMM d")}-${format(endDate, "d, yyyy")}`;
  }

  // Different years
  if (startDate.getFullYear() !== endDate.getFullYear()) {
    return `${format(startDate, "MMMM d, yyyy")} - ${format(
      endDate,
      "MMMM d, yyyy"
    )}`;
  }

  // Default case
  return `${format(startDate, "MMMM d")} - ${format(endDate, "MMMM d, yyyy")}`;
};

export const convertStringToDate = (dateString: string | Date): Date | null => {
  const convertedDate =
    dateString instanceof Date ? dateString : parseISO(dateString);

  if (convertedDate && isDate(convertedDate) && isValid(convertedDate)) {
    return convertedDate;
  }

  return null;
};

export const GetYesterdayTodayTomorrowFormat = (
  date: Date | string,
  baseFormat: string
): string => {
  const dateInput = typeof date === "string" ? parseISO(date) : date;

  let dateFormat = baseFormat;
  if (isYesterday(dateInput)) {
    dateFormat = `'Yesterday, ' h:mm a`;
  } else if (isToday(dateInput)) {
    dateFormat = `'Today, ' h:mm a`;
  } else if (isTomorrow(dateInput)) {
    dateFormat = `'Tomorrow,' h:mm a`;
  }
  return dateFormat;
};

export const getContiguousDateIntervals = (
  allDates: Date[],
  disabledDates?: Date[]
): DateInterval[] => {
  const nonAbsenceDisabledDates = disabledDates
    ? differenceWith(allDates, disabledDates, isSameDay)
    : allDates;

  const intervals: DateInterval[] = [];
  let index = 0;
  while (index < nonAbsenceDisabledDates.length) {
    let earlierDate = nonAbsenceDisabledDates[index];
    const interval: DateInterval = {
      start: earlierDate,
      end: earlierDate,
    };

    const endIntervalIndex = index + 1;
    if (endIntervalIndex >= nonAbsenceDisabledDates.length) {
      // Nothing more to look through or we have a single item scenario
      index = nonAbsenceDisabledDates.length;
      intervals.push(interval);
    }

    for (let j = endIntervalIndex; j < nonAbsenceDisabledDates.length; j++) {
      const nextDate = nonAbsenceDisabledDates[j];
      if (differenceInCalendarDays(nextDate, earlierDate) > 1) {
        index = j;
        intervals.push(interval);
        break;
      } else if (j === nonAbsenceDisabledDates.length - 1) {
        // Last item in the list
        index = nonAbsenceDisabledDates.length;
        intervals.push({
          ...interval,
          end: nextDate,
        });
      }
      earlierDate = nextDate;
      interval.end = nextDate;
    }
  }

  return intervals;
};

/*
  NOTE: we are using custom min/max functions instead of date-fn's because we need the date
  to keep the reference to the date object and date-fn's doesn't do that. It creates a copy
  which causes all sorts of weird things when React tries to do a shallow comparison of the
  dates.
*/
export const maxOfDates = (dates: Array<Date | undefined>) => {
  const actualDates = dates.filter(date => date !== undefined) as Date[];

  const [maxDate] = actualDates.sort(
    (a: Date, b: Date) => b.getTime() - a.getTime()
  );

  return maxDate;
};

export const minOfDates = (dates: Array<Date | undefined>) => {
  const actualDates = dates.filter(date => date !== undefined) as Date[];

  const [minDate] = actualDates.sort(
    (a: Date, b: Date) => a.getTime() - b.getTime()
  );

  return minDate;
};

export const sortDates = (date1: Date, date2: Date) => {
  const _date1 = date1.getTime();
  const _date2 = date2.getTime();

  return {
    earlier: new Date(Math.min(_date1, _date2)),
    later: new Date(Math.max(_date1, _date2)),
  };
};

export const DateFormatter = (createdUtc: string, t: any) => {
  return useMemo(() => {
    const now = new Date();
    const notificationDate = new Date(createdUtc);

    if (isEqual(startOfDay(now), startOfDay(notificationDate))) {
      return `${formatDistance(notificationDate, now)} ${t("ago")}`;
    } else if (startOfDay(notificationDate) > addDays(startOfDay(now), -6)) {
      return formatRelative(notificationDate, now);
    } else {
      return format(notificationDate, "MMM d, yyyy");
    }
  }, [createdUtc, t]);
};

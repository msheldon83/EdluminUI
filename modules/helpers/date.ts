import isAfter from "date-fns/isAfter";
import isValid from "date-fns/isValid";
import formatDistance from "date-fns/formatDistance";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import isWithinInterval from "date-fns/isWithinInterval";
import isEqual from "date-fns/isEqual";
import {
  differenceInDays,
  addDays,
  isDate,
  isYesterday,
  isToday,
  isTomorrow,
} from "date-fns";

export type PolymorphicDateType = Date | string | undefined;

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
    startDate.getDay() === endDate.getDay() &&
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
  const convertedDate = new Date(dateString);

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
    dateFormat = `'Yesterday'`;
  } else if (isToday(dateInput)) {
    dateFormat = `'Today'`;
  } else if (isTomorrow(dateInput)) {
    dateFormat = `'Tomorrow'`;
  }
  return dateFormat;
};

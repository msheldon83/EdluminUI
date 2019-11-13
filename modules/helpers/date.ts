import isAfter from "date-fns/isAfter";
import isValid from "date-fns/isValid";
import format from "date-fns/format";
import isWithinInterval from "date-fns/isWithinInterval";
import isEqual from "date-fns/isEqual";

export type PolymorphicDate = Date | string | undefined;

export const isAfterDate = (date1: PolymorphicDate, date2: PolymorphicDate) => {
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

export const formatDateIfPossible = (
  date: PolymorphicDate,
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

export const areDatesEqual = (start: PolymorphicDate, end: PolymorphicDate) => {
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
  { start, end }: { start: PolymorphicDate; end: PolymorphicDate }
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
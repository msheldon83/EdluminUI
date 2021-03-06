import { DayOfWeek } from "graphql/server-types.gen";
import i18next = require("i18next");
import { getDisplayName } from "ui/components/enumHelpers";
import { getDay, parseISO } from "date-fns";

export const daysOfWeekOrdered = [
  DayOfWeek.Sunday,
  DayOfWeek.Monday,
  DayOfWeek.Tuesday,
  DayOfWeek.Wednesday,
  DayOfWeek.Thursday,
  DayOfWeek.Friday,
  DayOfWeek.Saturday,
];

export const getDayOfWeekFromDate = (date: Date | string) => {
  const dateToCheck = typeof date === "string" ? parseISO(date) : date;

  const dow = getDay(dateToCheck);
  return daysOfWeekOrdered[dow];
};

// Use to sort an array of days of the week
export const sortDaysOfWeek = (daysOfWeek?: DayOfWeek[]) => {
  if (!daysOfWeek) {
    return [];
  }
  return daysOfWeek.sort(
    (a, b) => daysOfWeekOrdered.indexOf(a) - daysOfWeekOrdered.indexOf(b)
  );
};

// Can use when sorting an array by day of week properties
export const compareDaysOfWeek = (
  firstDay?: DayOfWeek | null,
  secondDay?: DayOfWeek | null
) => {
  if (!firstDay || !secondDay) {
    return 0;
  }

  const firstDayOrder = daysOfWeekOrdered.indexOf(firstDay);
  const secondDayOrder = daysOfWeekOrdered.indexOf(secondDay);

  return firstDayOrder > secondDayOrder
    ? 1
    : secondDayOrder > firstDayOrder
    ? -1
    : 0;
};

// Will build out a text string with the shortened day of the week
export const buildDaysLabel = (days: DayOfWeek[], t: i18next.TFunction) => {
  let result = "";
  let previousDayOrder = 0;
  let currentDayOrder = 0;
  let nextDayOrder = 0;

  days.forEach((day, i) => {
    currentDayOrder = daysOfWeekOrdered.indexOf(day);
    const displayName = getDisplayName("dayOfWeekShort", day, t) ?? "";

    previousDayOrder = daysOfWeekOrdered.indexOf(days[i - 1]);
    nextDayOrder = daysOfWeekOrdered.indexOf(days[i + 1]);

    if (i === days.length - 1) {
      result = result + `${displayName}`;
    } else {
      if (
        previousDayOrder !== -1 &&
        currentDayOrder - previousDayOrder === 1 &&
        nextDayOrder - currentDayOrder === 1
      ) {
        result = result.endsWith(", ")
          ? result.substring(0, result.length - 2)
          : result;
        result = result.endsWith("- ") ? result : result + " - ";
      } else {
        result = result + `${displayName}, `;
      }
    }
  });

  return result;
};

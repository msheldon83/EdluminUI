import { DayOfWeek } from "graphql/server-types.gen";
import i18next = require("i18next");
import { getDisplayName } from "ui/components/enumHelpers";

const daysOfWeekOrdered = [
  DayOfWeek.Sunday,
  DayOfWeek.Monday,
  DayOfWeek.Tuesday,
  DayOfWeek.Wednesday,
  DayOfWeek.Thursday,
  DayOfWeek.Friday,
  DayOfWeek.Saturday,
];

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
    const displayName = getDisplayName("dayOfWeekShort", day, t);

    if (i === 0 || i === days.length - 1) {
      result = result + displayName;
    } else {
      previousDayOrder = daysOfWeekOrdered.indexOf(days[i - 1]);
      nextDayOrder = daysOfWeekOrdered.indexOf(days[i + 1]);

      if (
        currentDayOrder - previousDayOrder === 1 &&
        (nextDayOrder - currentDayOrder != 1 || i + 1 === days.length - 1)
      ) {
        result = result + " - ";
      }

      if (nextDayOrder - currentDayOrder > 1) {
        result = result + `${displayName}, `;
      }
    }
  });

  return result;
};

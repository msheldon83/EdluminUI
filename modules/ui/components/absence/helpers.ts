import { DayPart } from "graphql/server-types.gen";
import { differenceWith, isEmpty } from "lodash-es";
import { isSameDay } from "date-fns";
import { TFunction } from "i18next";
import { DisabledDate } from "helpers/absence/computeDisabledDates";

export const dayPartToLabel = (dayPart: DayPart): string => {
  switch (dayPart) {
    case DayPart.FullDay:
      return "Full Day";
    case DayPart.HalfDayMorning:
      return "Half Day AM";
    case DayPart.HalfDayAfternoon:
      return "Half Day PM";
    case DayPart.Hourly:
      return "Hourly";
    case DayPart.QuarterDayEarlyMorning:
      return "Quarter Day Early Morning";
    case DayPart.QuarterDayLateMorning:
      return "Quarter Day Late Morning";
    case DayPart.QuarterDayEarlyAfternoon:
      return "Quarter Day Early Afternoon";
    case DayPart.QuarterDayLateAfternoon:
      return "Quarter Day Late Afternoon";
    default:
      return "Other";
  }
};

export const TranslateAbsenceErrorCodeToMessage = (
  errorCode: string,
  t: TFunction
) => {
  switch (errorCode) {
    case "OverlappingDetails":
      return t("Absence times cannot overlap.");
    case "NegativeBalances":
      return t("The balance for this absence reason is now below zero.");
    case "AbsenceStartsBeforeWorkday":
      return t("Absence starts before the scheduled start time.");
    case "AbsenceEndsAfterWorkday":
      return t("Absence ends after the scheduled end time.");
    default:
      console.log(`Absence Error Code unhandled: ${errorCode}`);
      return undefined;
  }
};

export const getAbsenceDates = (
  absenceDates: Date[],
  disabledDates: Date[]
) => {
  if (isEmpty(absenceDates)) {
    return null;
  }
  const dates = differenceWith(absenceDates, disabledDates, (a, b) =>
    isSameDay(a, b)
  );

  if (!dates.length) {
    return null;
  }
  return dates;
};

// Answers the question, "on which days can I not create an absence?"
export const getCannotCreateAbsenceDates = (disabledDates: DisabledDate[]) =>
  disabledDates.filter(d => d.type === "nonWorkDay").map(d => d.date);

export const payCodeIdsAreTheSame = (
  payCodeIds: (string | null | undefined)[]
) => {
  if (payCodeIds.length === 0) {
    return true;
  }

  const toCompare = payCodeIds[0];
  for (let i = 0; i < payCodeIds.length; i++) {
    const element = payCodeIds[i];

    if (!element && !toCompare) {
      // Both values are falsy so they are the same
      continue;
    }

    if (element !== toCompare) {
      return false;
    }
  }

  return true;
};

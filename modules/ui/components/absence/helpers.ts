import {
  DayPart,
  Absence,
  AbsenceDetail,
  Maybe,
  VacancyDetail,
} from "graphql/server-types.gen";
import { groupBy, differenceWith, uniqWith } from "lodash-es";
import { isAfter, isWithinInterval, format } from "date-fns";
import { convertStringToDate } from "helpers/date";
import { TFunction } from "i18next";

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

export const dayPartToTimesLabel = (dayPart: DayPart, times: ScheduleTimes) => {
  switch (dayPart) {
    case DayPart.FullDay:
      return `(${times.startTime} - ${times.endTime})`;
    case DayPart.HalfDayMorning:
      return `(${times.startTime} - ${times.halfDayMorningEnd})`;
    case DayPart.HalfDayAfternoon:
      return `(${times.halfDayAfternoonStart} - ${times.endTime})`;
    case DayPart.Hourly:
    case DayPart.QuarterDayEarlyMorning:
    case DayPart.QuarterDayLateMorning:
    case DayPart.QuarterDayEarlyAfternoon:
    case DayPart.QuarterDayLateAfternoon:
    default:
      return "";
  }
};

export type ScheduleTimes = {
  startTime: string;
  halfDayMorningEnd: string;
  halfDayAfternoonStart: string;
  endTime: string;
};

export type ReplacementEmployeeForVacancy = {
  employeeId: number;
  firstName: string;
  lastName: string;
  assignmentId: string;
  assignmentRowVersion: string;
};

export const getReplacementEmployeeForVacancy = (
  absence: Absence | undefined
): ReplacementEmployeeForVacancy | null => {
  if (!absence) {
    return null;
  }

  const hasReplacementEmployee =
    absence.vacancies &&
    absence.vacancies[0] &&
    absence.vacancies[0].details &&
    absence.vacancies[0].details[0] &&
    absence.vacancies[0].details[0]?.assignment?.employeeId;

  if (!hasReplacementEmployee) {
    return null;
  }

  const assignment = absence.vacancies![0]!.details![0]!.assignment!;
  return {
    employeeId: assignment.employeeId,
    firstName: assignment.employee?.firstName || "",
    lastName: assignment.employee?.lastName || "",
    assignmentId: assignment.id,
    assignmentRowVersion: assignment.rowVersion,
  };
};

export const getScheduleLettersArray = () => {
  return new Array(26).fill(1).map((_, i) => String.fromCharCode(65 + i));
};

type DetailsGroup<T> = {
  startDate: Date;
  endDate?: Date;
  detailItems: DetailsItemByDate<T>[];
  simpleDetailItems?: T[];
};

export type AbsenceDetailsGroup = DetailsGroup<AbsenceDetailsItem> & {
  absenceReasonId?: number;
};

export type VacancyDetailsGroup = DetailsGroup<VacancyDetailsItem> & {
  schedule?: string;
};

type DetailsItem = {
  startTime: string;
  endTime: string;
};
type DetailsItemByDate<T> = T & { date: Date };

export type AbsenceDetailsItem = DetailsItem & {
  dayPart: DayPart;
  absenceReasonId: number;
};

export type VacancyDetailsItem = DetailsItem & {
  locationId: number | null | undefined;
  locationName: string | null | undefined;
};

export const getAbsenceDetailsGrouping = (absence: Absence) => {
  if (!absence.details) {
    return null;
  }

  // Put the details in order by start date and time
  const sortedAbsenceDetails = absence.details
    .slice()
    .sort((a, b) => a!.startTimeLocal - b!.startTimeLocal);

  // Group all of the details that are on the same day together
  const detailsGroupedByStartDate = groupBy(sortedAbsenceDetails, d => {
    return d!.startDate;
  });

  const detailsGroupings: AbsenceDetailsGroup[] = [];
  Object.entries(detailsGroupedByStartDate).forEach(([key, value]) => {
    const keyAsDate = new Date(`${key} 00:00`);
    // Look for a potential matching group to add to
    const potentialGroup = detailsGroupings.find(g => {
      if (!g.endDate) {
        return isAfter(keyAsDate, g.startDate);
      }

      return isWithinInterval(keyAsDate, {
        start: g.startDate,
        end: g.endDate,
      });
    });

    // Determine if we're going to add to the Group we found or not
    let addToGroup = false;
    if (potentialGroup) {
      const valuesAsDetailItems = convertAbsenceDetailsToDetailsItem(
        keyAsDate,
        value
      );
      const differences = differenceWith(
        valuesAsDetailItems,
        potentialGroup.detailItems,
        (a, b) => {
          return (
            a.startTime === b.startTime &&
            a.endTime === b.endTime &&
            a.absenceReasonId === b.absenceReasonId
          );
        }
      );
      addToGroup = !differences.length;
    }

    if (potentialGroup && addToGroup) {
      potentialGroup.detailItems.push(
        ...convertAbsenceDetailsToDetailsItem(keyAsDate, value)
      );
    } else {
      if (potentialGroup) {
        // Set the endDate of the previous Group
        potentialGroup.endDate =
          potentialGroup.detailItems[
            potentialGroup.detailItems.length - 1
          ].date;
      }

      // Add a new grouping item
      detailsGroupings.push({
        startDate: new Date(`${key} 00:00`),
        detailItems: convertAbsenceDetailsToDetailsItem(keyAsDate, value),
      });
    }
  });

  if (detailsGroupings && detailsGroupings.length) {
    // Set the endDate on the last item
    const lastItem = detailsGroupings[detailsGroupings.length - 1];
    lastItem.endDate =
      lastItem.detailItems[lastItem.detailItems.length - 1].date;
  }

  // Populate the simple detail items on the groups
  detailsGroupings.forEach(g => {
    g.absenceReasonId = g.detailItems[0].absenceReasonId;
    g.simpleDetailItems = uniqWith(
      g.detailItems.map(di => {
        return {
          dayPart: di.dayPart,
          startTime: di.startTime,
          endTime: di.endTime,
          absenceReasonId: di.absenceReasonId,
        };
      }),
      (a, b) => {
        return (
          a.startTime === b.startTime &&
          a.endTime === b.endTime &&
          a.absenceReasonId === b.absenceReasonId &&
          a.dayPart === b.dayPart
        );
      }
    );
  });

  return detailsGroupings;
};

const convertAbsenceDetailsToDetailsItem = (
  date: Date,
  details: Maybe<AbsenceDetail>[]
): DetailsItemByDate<AbsenceDetailsItem>[] => {
  const detailItems = details.map(d => {
    const startTime = convertStringToDate(d!.startTimeLocal);
    const endTime = convertStringToDate(d!.endTimeLocal);
    if (!startTime || !endTime) {
      return;
    }

    return {
      date: date,
      dayPart: d!.dayPartId,
      startTime: format(startTime, "h:mm a"),
      endTime: format(endTime, "h:mm a"),
      absenceReasonId:
        d!.reasonUsages && d!.reasonUsages[0]
          ? d!.reasonUsages[0].absenceReasonId
          : undefined,
    };
  });
  const populatedItems = detailItems.filter(
    d => d !== undefined && d.absenceReasonId !== undefined
  ) as DetailsItemByDate<AbsenceDetailsItem>[];
  return populatedItems;
};

export const getVacancyDetailsGrouping = (
  vacancyDetails: Maybe<VacancyDetail>[]
): VacancyDetailsGroup[] => {
  // Put the details in order by start date and time
  const sortedVacancyDetails = vacancyDetails
    .slice()
    .sort((a, b) => a!.startTimeLocal - b!.startTimeLocal);

  // Group all of the details that are on the same day together
  const detailsGroupedByStartDate = groupBy(sortedVacancyDetails, d => {
    return d!.startDate;
  });

  const detailsGroupings: VacancyDetailsGroup[] = [];
  Object.entries(detailsGroupedByStartDate).forEach(([key, value]) => {
    const keyAsDate = new Date(`${key} 00:00`);
    // Look for a potential matching group to add to
    const potentialGroup = detailsGroupings.find(g => {
      if (!g.endDate) {
        return isAfter(keyAsDate, g.startDate);
      }

      return isWithinInterval(keyAsDate, {
        start: g.startDate,
        end: g.endDate,
      });
    });

    // Determine if we're going to add to the Group we found or not
    let addToGroup = false;
    if (potentialGroup) {
      const valuesAsDetailItems = convertVacancyDetailsToDetailsItem(
        keyAsDate,
        value
      );
      const differences = differenceWith(
        valuesAsDetailItems,
        potentialGroup.detailItems,
        (a, b) => {
          return (
            a.startTime === b.startTime &&
            a.endTime === b.endTime &&
            a.locationId === b.locationId
          );
        }
      );
      addToGroup = !differences.length;
    }

    if (potentialGroup && addToGroup) {
      potentialGroup.detailItems.push(
        ...convertVacancyDetailsToDetailsItem(keyAsDate, value)
      );
    } else {
      if (potentialGroup) {
        // Set the endDate of the previous Group
        potentialGroup.endDate =
          potentialGroup.detailItems[
            potentialGroup.detailItems.length - 1
          ].date;
      }

      // Add a new grouping item
      detailsGroupings.push({
        startDate: new Date(`${key} 00:00`),
        detailItems: convertVacancyDetailsToDetailsItem(keyAsDate, value),
      });
    }
  });

  if (detailsGroupings && detailsGroupings.length) {
    // Set the endDate on the last item
    const lastItem = detailsGroupings[detailsGroupings.length - 1];
    lastItem.endDate =
      lastItem.detailItems[lastItem.detailItems.length - 1].date;
  }

  // Populate the simple detail items on the groups
  detailsGroupings.forEach(g => {
    g.simpleDetailItems = uniqWith(
      g.detailItems.map(di => {
        return {
          startTime: di.startTime,
          endTime: di.endTime,
          locationId: di.locationId,
          locationName: di.locationName,
        };
      }),
      (a, b) => {
        return (
          a.startTime === b.startTime &&
          a.endTime === b.endTime &&
          a.locationId === b.locationId
        );
      }
    );
  });

  // Set the appropriate Schedule letter on like groupings
  const scheduleLetters = getScheduleLettersArray();
  let scheduleIndex = 0;
  detailsGroupings.forEach(g => {
    // Look for a matching existing group that already has a Schedule letter
    const matchedGroup = detailsGroupings.find(d => {
      if (!d.schedule || !g.simpleDetailItems || !d.simpleDetailItems) {
        return false;
      }

      // If all of the Start Times, End Times, and Locations match, this is the same Schedule
      const differences = differenceWith(
        g.simpleDetailItems,
        d.simpleDetailItems,
        (a, b) => {
          return (
            a.startTime === b.startTime &&
            a.endTime === b.endTime &&
            a.locationId === b.locationId
          );
        }
      );
      return !differences.length;
    });

    if (matchedGroup) {
      g.schedule = matchedGroup.schedule;
    } else {
      g.schedule = scheduleLetters[scheduleIndex];
      scheduleIndex = scheduleIndex + 1;
    }
  });

  return detailsGroupings;
};

const convertVacancyDetailsToDetailsItem = (
  date: Date,
  details: Maybe<VacancyDetail>[]
): DetailsItemByDate<VacancyDetailsItem>[] => {
  const detailItems = details.map(v => {
    const startTime = convertStringToDate(v!.startTimeLocal);
    const endTime = convertStringToDate(v!.endTimeLocal);
    if (!startTime || !endTime) {
      return;
    }

    return {
      date: date,
      startTime: format(startTime, "h:mm a"),
      endTime: format(endTime, "h:mm a"),
      locationId: v!.locationId,
      locationName: v!.location?.name,
    };
  });
  const populatedItems = detailItems.filter(
    d => d !== undefined
  ) as DetailsItemByDate<VacancyDetailsItem>[];
  return populatedItems;
};

export const TranslateAbsenceErrorCodeToMessage = (
  errorCode: string,
  t: TFunction
) => {
  switch (errorCode) {
    case "AbsenceDetailTooShort":
      break;
    case "OverlappingDetails":
      break;
    case "NegativeBalances":
      break;
    case "MissingDayPart":
      break;
    case "AbsenceStartsBeforeWorkday":
      break;
    case "AbsenceEndsAfterWorkday":
      break;
    default:
      console.log(`Absence Error Code unhandled: ${errorCode}`);
      return undefined;
  }
};

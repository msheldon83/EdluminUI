import {
  DayPart,
  Absence,
  AbsenceDetail,
  Maybe,
  AbsenceDetailCreateInput,
  Vacancy,
} from "graphql/server-types.gen";
import { groupBy, differenceWith, uniqWith, isEmpty } from "lodash-es";
import {
  isAfter,
  isWithinInterval,
  format,
  isSameDay,
  parseISO,
  isEqual as isDateEqual,
  isBefore,
} from "date-fns";
import { convertStringToDate } from "helpers/date";
import { TFunction } from "i18next";
import { secondsSinceMidnight, parseTimeFromString } from "helpers/time";
import { DisabledDate } from "helpers/absence/computeDisabledDates";
import { VacancyDetail, AssignmentOnDate } from "./types";
import { projectVacancyDetailsFromVacancies } from "ui/pages/create-absence/project-vacancy-details";
import { AccountingCodeValue } from "../form/accounting-code-dropdown";
import {
  accountingCodeAllocationsAreTheSame,
  mapAccountingCodeValueToAccountingCodeAllocations,
} from "helpers/accounting-code-allocations";

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
      return times.halfDayMorningEnd
        ? `(${times.startTime} - ${times.halfDayMorningEnd})`
        : null;
    case DayPart.HalfDayAfternoon:
      return times.halfDayAfternoonStart
        ? `(${times.halfDayAfternoonStart} - ${times.endTime})`
        : null;
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
  halfDayMorningEnd: string | null;
  halfDayAfternoonStart: string | null;
  endTime: string;
};

export type ReplacementEmployeeForVacancy = {
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
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
    absence.vacancies[0].details[0]?.assignment?.employee?.id;

  if (!hasReplacementEmployee) {
    return null;
  }

  const assignment = absence.vacancies![0]!.details[0]!.assignment!;
  return {
    employeeId: assignment.employee?.id ?? "",
    firstName: assignment.employee?.firstName || "",
    lastName: assignment.employee?.lastName || "",
    email: assignment.employee?.email ?? undefined,
    assignmentId: assignment.id,
    assignmentRowVersion: assignment.rowVersion,
  };
};

type DetailsGroup<T> = {
  startDate: Date;
  endDate?: Date;
  detailItems: DetailsItemByDate<T>[];
  simpleDetailItems?: T[];
};

export type AbsenceDetailsGroup = DetailsGroup<AbsenceDetailsItem> & {
  absenceReasonId?: string;
};

export type VacancyDetailsGroup = DetailsGroup<VacancyDetailsItem> & {
  absenceStartTime?: Date;
  absenceEndTime?: Date;
  assignmentId?: string;
  assignmentRowVersion?: string;
  assignmentStartTime?: Date;
  assignmentEmployeeId?: string;
  assignmentEmployeeFirstName?: string;
  assignmentEmployeeLastName?: string;
  assignmentEmployeeEmail?: string;
};

type DetailsItem = {
  startTime: string;
  endTime: string;
};
type DetailsItemByDate<T> = T & { date: Date };

export type AbsenceDetailsItem = DetailsItem & {
  dayPart: DayPart;
  absenceReasonId: string;
};

export type VacancyDetailsItem = DetailsItem & {
  vacancyDetailId: string | undefined;
  locationId: string | null | undefined;
  locationName: string | null | undefined;
  assignmentId?: string;
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
    const keyAsDate = parseISO(key);
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
        startDate: parseISO(key),
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
  vacancyDetails: VacancyDetail[]
): VacancyDetailsGroup[] => {
  // Put the details in order by start date and time
  const sortedVacancyDetails = vacancyDetails.slice().sort((a, b) => {
    const startTimeAsDateA = parseISO(a.startTime);
    const startTimeAsDateB = parseISO(b.startTime);

    if (isDateEqual(startTimeAsDateA, startTimeAsDateB)) {
      // Fairly unlikely to occur
      return 0;
    }

    return isBefore(startTimeAsDateA, startTimeAsDateB) ? -1 : 1;
  });

  // Group all of the details that are on the same day together
  const detailsGroupedByStartDate = groupBy(sortedVacancyDetails, d => {
    return d.date;
  });

  const detailsGroupings: VacancyDetailsGroup[] = [];
  Object.entries(detailsGroupedByStartDate).forEach(([key, value]) => {
    const keyAsDate = parseISO(key);
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
            a.locationId === b.locationId &&
            a.assignmentId === b.assignmentId
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
        startDate: parseISO(key),
        detailItems: convertVacancyDetailsToDetailsItem(keyAsDate, value),
        absenceStartTime: value[0]?.absenceStartTime
          ? parseISO(value[0]?.absenceStartTime)
          : undefined,
        absenceEndTime: value[0]?.absenceEndTime
          ? parseISO(value[0]?.absenceEndTime)
          : undefined,
        assignmentId: value[0].assignmentId,
        assignmentRowVersion: value[0].assignmentRowVersion,
        assignmentStartTime: value[0].assignmentStartDateTime
          ? parseISO(value[0].assignmentStartDateTime)
          : undefined,
        assignmentEmployeeId: value[0].assignmentEmployeeId,
        assignmentEmployeeFirstName: value[0].assignmentEmployeeFirstName,
        assignmentEmployeeLastName: value[0].assignmentEmployeeLastName,
        assignmentEmployeeEmail: value[0].assignmentEmployeeEmail,
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
          vacancyDetailId: undefined,
          startTime: di.startTime,
          endTime: di.endTime,
          locationId: di.locationId,
          locationName: di.locationName,
          assignmentId: di.assignmentId,
        };
      }),
      (a, b) => {
        return (
          a.startTime === b.startTime &&
          a.endTime === b.endTime &&
          a.locationId === b.locationId &&
          a.assignmentId === b.assignmentId
        );
      }
    );
  });

  return detailsGroupings;
};

const convertVacancyDetailsToDetailsItem = (
  date: Date,
  details: VacancyDetail[]
): DetailsItemByDate<VacancyDetailsItem>[] => {
  const detailItems = details.map(v => {
    const startTime = convertStringToDate(v.startTime);
    const endTime = convertStringToDate(v.endTime);
    if (!startTime || !endTime) {
      return;
    }

    return {
      vacancyDetailId: v.vacancyDetailId,
      date: date,
      startTime: format(startTime, "h:mm a"),
      endTime: format(endTime, "h:mm a"),
      locationId: v.locationId,
      locationName: v.locationName,
      assignmentId: v.assignmentId,
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

// export const findEmployee = (data: FindEmployeeForCurrentUserQuery) => {
//   const orgUsers = data.userAccess?.me?.user?.orgUsers ?? [];
//   const emps = compact(map(orgUsers, u => u?.employee));
//   return emps[0];
// };

export const createAbsenceDetailInput = (
  dates: Date[],
  absenceReason: string,
  dayPart?: DayPart,
  hourlyStartTime?: Date,
  hourlyEndTime?: Date
) => {
  return dates.map(d => {
    let detail: AbsenceDetailCreateInput = {
      date: format(d, "P"),
      dayPartId: dayPart,
      reasons: [{ absenceReasonId: absenceReason }],
    };

    if (dayPart === DayPart.Hourly) {
      detail = {
        ...detail,
        startTime: secondsSinceMidnight(
          parseTimeFromString(format(hourlyStartTime!, "h:mm a"))
        ),
        endTime: secondsSinceMidnight(
          parseTimeFromString(format(hourlyEndTime!, "h:mm a"))
        ),
      };
    }

    return detail;
  });
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

export const getGroupedVacancyDetails = (
  vacancies: Vacancy[],
  assignmentsByDate: AssignmentOnDate[]
) => {
  if (!vacancies) {
    return [];
  }

  const sortedVacancies = vacancies
    .slice()
    .sort((a, b) => a.startTimeLocal - b.startTimeLocal);

  const allGroupedDetails: VacancyDetailsGroup[] = [];
  sortedVacancies.forEach(v => {
    if (v.details && v.details.length > 0) {
      const projectedDetails = projectVacancyDetailsFromVacancies([v]);
      if (assignmentsByDate.length > 0) {
        projectedDetails
          .filter(d => !d.assignmentId)
          .forEach(d => {
            // Find a matching record in assignmentsByDate
            const match = assignmentsByDate.find(a => a.date === d.date);
            if (match) {
              d.assignmentId = match.assignmentId;
              d.assignmentRowVersion = match.assignmentRowVersion;
              d.assignmentStartDateTime = match.assignmentStartDateTime;
              d.assignmentEmployeeId = match.assignmentEmployeeId;
              d.assignmentEmployeeFirstName = match.assignmentEmployeeFirstName;
              d.assignmentEmployeeLastName = match.assignmentEmployeeLastName;
              d.assignmentEmployeeEmail = match.assignmentEmployeeEmail;
            }
          });
      }

      const groupedDetails = getVacancyDetailsGrouping(projectedDetails);
      if (groupedDetails !== null && groupedDetails.length > 0) {
        allGroupedDetails.push(...groupedDetails);
      }
    }
  });

  return allGroupedDetails;
};

export const vacancyDetailsHaveDifferentAccountingCodeSelections = (
  vacancyDetails: VacancyDetail[],
  accountingCodeAllocations: AccountingCodeValue | null
) => {
  if (!vacancyDetails || vacancyDetails.length === 0) {
    return false;
  }

  const allocations = mapAccountingCodeValueToAccountingCodeAllocations(
    accountingCodeAllocations
  );
  const details = vacancyDetails.map(vd =>
    mapAccountingCodeValueToAccountingCodeAllocations(
      vd.accountingCodeAllocations
    )
  );
  return !accountingCodeAllocationsAreTheSame(allocations, details);
};

export const vacancyDetailsHaveDifferentPayCodeSelections = (
  vacancyDetails: VacancyDetail[],
  payCodeIdToCompare: string | null
) => {
  if (!vacancyDetails || vacancyDetails.length === 0) {
    return false;
  }

  for (let i = 0; i < vacancyDetails.length; i++) {
    const d = vacancyDetails[i];
    const detailPayCodeId = d?.payCodeId ?? null;
    if (detailPayCodeId !== payCodeIdToCompare) {
      return true;
    }
  }

  return false;
};

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

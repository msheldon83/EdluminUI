import { GetEmployeeAbsenceSchedule } from "./graphql/get-employee-absence-schedule.gen";
import {
  Absence,
  PositionScheduleDateDetail,
  CalendarDayType,
  VacancyDetail,
  DayPart,
  ApprovalStatus,
} from "graphql/server-types.gen";
import {
  parseISO,
  format,
  differenceInCalendarMonths,
  startOfMonth,
  addMonths,
  isSameMonth,
  isSameDay,
  differenceInHours,
  eachDayOfInterval,
  isEqual,
  startOfDay,
} from "date-fns";
import { GetEmployeePositionContractSchedule } from "./graphql/get-employee-position-contract-schedule.gen";
import { flatMap, range, groupBy, compact, uniq } from "lodash-es";
import {
  EmployeeAbsenceDetail,
  PositionScheduleDate,
  ContractDate,
  ScheduleDateGroupByMonth,
  ScheduleDate,
  EmployeeAbsenceAssignment,
  CalendarScheduleDate,
} from "./types";
import { TFunction } from "i18next";
import { generateMonths } from "../substitutes/grouping-helpers";
import { breakLabel } from "ui/pages/approval-workflow/components/workflow-graph/text-helper";

export const GetEmployeeAbsenceDetails = (
  absences: GetEmployeeAbsenceSchedule.EmployeeAbsenceSchedule[]
): EmployeeAbsenceDetail[] => {
  return absences.map(
    (
      a: Pick<
        Absence,
        | "id"
        | "details"
        | "startDate"
        | "endDate"
        | "numDays"
        | "totalDayPortion"
        | "startTimeLocal"
        | "endTimeLocal"
        | "vacancies"
        | "approvalStatus"
      >
    ) => {
      const allVacancyDetails = compact(
        flatMap(
          (a.vacancies ?? [])
            .filter(v => v)
            .map(v => v?.details?.filter(d => d))
        )
      );
      const assignedDetails = allVacancyDetails.filter(d => !!d.assignmentId);
      const assignments = buildAssignments(assignedDetails);

      return {
        id: a.id,
        absenceReason: a.details![0]!.reasonUsages![0]!.absenceReason!.name,
        startDate: parseISO(a.startDate),
        endDate: parseISO(a.endDate),
        numDays: Number(a.numDays),
        allDayParts:
          a.details && a.details.length > 0
            ? a.details.map(d => ({
                dayPart: d!.dayPartId!,
                dayPortion: d!.dayPortion,
                hourDuration: differenceInHours(
                  parseISO(d!.endTimeLocal),
                  parseISO(d!.startTimeLocal)
                ),
              }))
            : [],
        startTime: format(parseISO(a.startTimeLocal), "h:mm a"),
        startTimeLocal: parseISO(a.startTimeLocal),
        endTime: format(parseISO(a.endTimeLocal), "h:mm a"),
        endTimeLocal: parseISO(a.endTimeLocal),
        subRequired: !!a.vacancies && a.vacancies.length > 0,
        assignments: assignments,
        isFilled: assignedDetails.length > 0,
        isPartiallyFilled:
          assignedDetails.length > 0 &&
          allVacancyDetails.length != assignedDetails.length,
        multipleSubsAssigned: assignments.length > 1,
        allDays:
          a.details && a.details.length > 0
            ? a.details.map(d => parseISO(d!.startDate))
            : [],
        approvalStatus: a.approvalStatus ?? ApprovalStatus.Unknown,
      };
    }
  );
};

const buildAssignments = (
  assignedDetails: VacancyDetail[]
): EmployeeAbsenceAssignment[] => {
  if (assignedDetails.length === 0) {
    return [];
  }

  // Sort the details
  const sortedDetails = assignedDetails
    .slice()
    .sort((a, b) => a.startTimeLocal - b.startTimeLocal);

  const assignmentDetails: EmployeeAbsenceAssignment[] = [];
  // Build up the list of Assignment details grouping by Employee and days in a row
  let currentAssignment: EmployeeAbsenceAssignment = {
    employeeId: sortedDetails[0].assignment!.employee!.id,
    name: `${sortedDetails[0].assignment!.employee!.firstName} ${
      sortedDetails[0].assignment!.employee!.lastName
    }`,
    phoneNumber: sortedDetails[0].assignment!.employee!.formattedPhone,
    allDates: [],
    verifiedAtUtc: sortedDetails[0].verifiedAtUtc,
  };
  sortedDetails.forEach(d => {
    if (d.assignment?.employeeId !== currentAssignment.employeeId) {
      // Add existing currentAssignment to the list and create a new one
      assignmentDetails.push({ ...currentAssignment });
      currentAssignment = {
        employeeId: d.assignment!.employee!.id,
        name: `${d.assignment!.employee!.firstName} ${
          d.assignment!.employee!.lastName
        }`,
        phoneNumber: d.assignment!.employee!.formattedPhone,
        allDates: [],
        verifiedAtUtc: d.verifiedAtUtc,
      };
    }

    currentAssignment.allDates.push(
      ...eachDayOfInterval({
        start: parseISO(d.startTimeLocal),
        end: parseISO(d.endTimeLocal),
      })
    );
  });

  // Add the last instance of currentAssignment to the list
  assignmentDetails.push({ ...currentAssignment });
  return assignmentDetails;
};

export const GetContractDates = (
  contractSchedule: GetEmployeePositionContractSchedule.EmployeeContractSchedule[]
): ContractDate[] => {
  return contractSchedule.map(c => {
    const hasCalendarChange = !!c.calendarChange;
    return {
      date: parseISO(c.date),
      calendarDayType: c.calendarDayTypeId,
      hasCalendarChange: hasCalendarChange,
      calendarChangeDescription: c.calendarChange?.description ?? undefined,
      calendarChangeReasonName:
        c.calendarChange?.calendarChangeReason?.name ?? undefined,
      startDate: hasCalendarChange
        ? parseISO(c.calendarChange!.startDate)
        : undefined,
      endDate: hasCalendarChange
        ? parseISO(c.calendarChange!.endDate)
        : undefined,
    };
  });
};

export const GetPositionScheduleDates = (
  positionSchedule: GetEmployeePositionContractSchedule.EmployeePositionSchedule[]
): PositionScheduleDate[] => {
  return flatMap(positionSchedule, p => {
    if (!p || !p.details) {
      return [];
    }

    return p.details.map(d => {
      const detail = d as Pick<
        PositionScheduleDateDetail,
        "startDate" | "startTimeLocal" | "endTimeLocal" | "location"
      >;

      return {
        position: p.position?.title ?? "",
        date: parseISO(detail.startDate),
        startTime: format(parseISO(detail.startTimeLocal), "h:mm a"),
        endTime: format(parseISO(detail.endTimeLocal), "h:mm a"),
        location: detail.location?.name ?? "",
        nonStandardVariantTypeName:
          p.workScheduleVariantType && !p.workScheduleVariantType.isStandard
            ? p.workScheduleVariantType?.name
            : undefined,
      };
    });
  });
};

export const GroupEmployeeScheduleByMonth = (
  startDate: Date,
  endDate: Date,
  absences: EmployeeAbsenceDetail[],
  contractDates: ContractDate[],
  positionScheduleDates: PositionScheduleDate[]
): { month: string; dates: CalendarScheduleDate[] }[] => {
  const allDates: Record<string, CalendarScheduleDate> = {};
  const dateLookup = (date: Date): CalendarScheduleDate => {
    const dateString = startOfDay(date).toISOString();
    if (!(dateString in allDates)) {
      allDates[dateString] = {
        date,
        absences: [],
        closedDays: [],
        modifiedDays: [],
        contractInstructionalDays: [],
        inServiceDays: [],
        nonWorkDays: [],
      };
    }
    return allDates[dateString];
  };
  absences.forEach(a => {
    a.allDays.forEach(d => dateLookup(d).absences.push(a));
  });
  contractDates.forEach(c => {
    const entry = dateLookup(c.date);
    switch (c.calendarDayType) {
      case CalendarDayType.NonWorkDay:
        (c.calendarChangeReasonName
          ? entry.closedDays
          : entry.nonWorkDays
        ).push(c);
        break;
      case CalendarDayType.TeacherWorkDay:
        entry.inServiceDays.push(c);
        break;
      case CalendarDayType.CancelledDay:
        entry.closedDays.push(c);
        break;
      case CalendarDayType.InstructionalDay:
        if (c.hasCalendarChange) entry.contractInstructionalDays.push(c);
        break;
      default:
        break;
    }
  });
  positionScheduleDates
    .filter(p => p.nonStandardVariantTypeName)
    .forEach(p => dateLookup(p.date).modifiedDays.push(p));

  const months = generateMonths(startDate, endDate);
  const groupedDates = groupBy(Object.values(allDates), v =>
    startOfMonth(v.date).toISOString()
  );

  return months.map(month => ({
    month,
    dates: month in groupedDates ? groupedDates[month] : [],
  }));
};

export const getDateRangeDisplay = (startDate: Date, endDate: Date) => {
  return isEqual(startDate, endDate)
    ? format(startDate, "MMM d")
    : isSameMonth(startDate, endDate)
    ? `${format(startDate, "MMM d")} - ${format(endDate, "d")}`
    : `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`;
};

const determineDayPartLabel = (
  dayPart: DayPart,
  count: number,
  t: TFunction
) => {
  switch (dayPart) {
    case DayPart.FullDay:
      return count > 1 ? t("Full Days") : t("Full Day");
    case DayPart.HalfDayMorning:
      return count > 1 ? t("Half Days AM") : t("Half Day AM");
    case DayPart.HalfDayAfternoon:
      return count > 1 ? t("Half Days PM") : t("Half Day PM");
    case DayPart.Hourly:
      return count > 1 ? t("Hours") : t("Hour");
    case DayPart.QuarterDayEarlyAfternoon:
    case DayPart.QuarterDayLateAfternoon:
    case DayPart.QuarterDayEarlyMorning:
    case DayPart.QuarterDayLateMorning:
      return count > 1 ? t("Quarter Days") : t("Quarter Day");
    default:
      break;
  }
};

export const getDayPartCountLabels = (
  allDayParts: {
    dayPart: DayPart;
    dayPortion: number;
    hourDuration: number;
  }[],
  t: TFunction
) => {
  return uniq(compact(allDayParts.map(d => d.dayPart))).map(u => {
    const count =
      u === DayPart.Hourly
        ? allDayParts
            .filter(x => x.dayPart === u)
            .map(x => x.hourDuration)
            .reduce((a, b) => a + b, 0)
        : allDayParts.filter(x => x.dayPart === u).length;
    return `${count} ${determineDayPartLabel(u, count, t)}`;
  });
};

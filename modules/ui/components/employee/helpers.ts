import { GetEmployeeAbsenceSchedule } from "./graphql/get-employee-absence-schedule.gen";
import {
  Absence,
  PositionScheduleDateDetail,
  CalendarDayType,
} from "graphql/server-types.gen";
import {
  parseISO,
  format,
  differenceInCalendarMonths,
  startOfMonth,
  addMonths,
  isSameDay,
} from "date-fns";
import { GetEmployeePositionContractSchedule } from "./graphql/get-employee-position-contract-schedule.gen";
import { flatMap, concat, range, map, groupBy } from "lodash-es";
import {
  EmployeeAbsenceDetail,
  PositionScheduleDate,
  ContractDate,
  ScheduleDateGroupByMonth,
  ScheduleDate,
} from "./types";

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
      >
    ) => {
      const assignment =
        a.vacancies &&
        a.vacancies[0]?.details &&
        a.vacancies[0]?.details[0]?.assignment
          ? a.vacancies[0]?.details[0]?.assignment
          : undefined;

      return {
        id: a.id,
        absenceReason: a.details![0]!.reasonUsages![0]!.absenceReason!.name,
        startDate: parseISO(a.startDate),
        endDate: parseISO(a.endDate),
        numDays: Number(a.numDays),
        totalDayPortion: Number(a.totalDayPortion),
        dayPart: a.details![0]!.dayPartId!,
        startTime: format(parseISO(a.startTimeLocal), "h:mm a"),
        startTimeLocal: parseISO(a.startTimeLocal),
        endTime: format(parseISO(a.endTimeLocal), "h:mm a"),
        endTimeLocal: parseISO(a.endTimeLocal),
        subRequired: !!a.vacancies && a.vacancies.length > 0,
        substitute: assignment
          ? {
              name: `${assignment.employee!.firstName} ${
                assignment.employee!.lastName
              }`,
              phoneNumber: assignment.employee!.formattedPhone,
            }
          : undefined,
        allDays:
          a.details && a.details.length > 0
            ? a.details.map(d => parseISO(d!.startDate))
            : [],
      };
    }
  );
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
        position: p.position?.name ?? "",
        date: parseISO(detail.startDate),
        startTime: format(parseISO(detail.startTimeLocal), "h:mm a"),
        endTime: format(parseISO(detail.endTimeLocal), "h:mm a"),
        location: detail.location?.name ?? "",
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
): ScheduleDateGroupByMonth[] => {
  // Combine all dates into a common object
  const allDates: ScheduleDate[] = [];
  allDates.push(
    ...flatMap(absences, a => {
      return a.allDays.map(d => {
        return { date: d, type: "absence", rawData: a } as ScheduleDate;
      });
    })
  );
  allDates.push(
    // Instructional Day information will be added from the Position Schedule below
    ...contractDates
      .filter(c => c.calendarDayType !== CalendarDayType.InstructionalDay)
      .map(c => {
        let description = undefined;
        if (c.hasCalendarChange) {
          if (!!c.calendarChangeDescription && !!c.calendarChangeReasonName) {
            description = `${c.calendarChangeReasonName} - ${c.calendarChangeDescription}`;
          } else if (!!c.calendarChangeReasonName) {
            description = c.calendarChangeReasonName;
          } else if (!!c.calendarChangeDescription) {
            description = c.calendarChangeDescription;
          }
        }

        return {
          date: c.date,
          type: getScheduleDateType(c.calendarDayType),
          rawData: c,
          description: description,
        } as ScheduleDate;
      })
  );
  allDates.push(
    // Only add days that aren't already accounted for above
    ...positionScheduleDates
      .filter(p => allDates.find(a => isSameDay(a.date, p.date)) === undefined)
      .map(p => {
        return {
          date: p.date,
          type: "instructionalDay",
          rawData: p,
        } as ScheduleDate;
      })
  );

  // Get all the months
  const diff = differenceInCalendarMonths(endDate, startDate) + 1;
  const absDiff = Math.abs(diff);
  const delta = diff > 0 ? 1 : -1;

  const months: ScheduleDateGroupByMonth[] =
    absDiff > 1
      ? range(0, absDiff).map(i => ({
          month: startOfMonth(addMonths(startDate, i * delta)).toISOString(),
          scheduleDates: [],
        }))
      : [];

  Object.entries(
    groupBy(allDates, a => startOfMonth(a.date).toISOString())
  ).map(([date, scheduleDates]) => {
    const month = months.find(e => e.month === date);
    if (!month) return;
    month.scheduleDates = scheduleDates;
  });

  return months;
};

const getScheduleDateType = (
  calendarDayType: CalendarDayType
): ScheduleDate["type"] => {
  switch (calendarDayType) {
    case CalendarDayType.NonWorkDay:
      return "nonWorkDay";
    case CalendarDayType.TeacherWorkDay:
      return "teacherWorkDay";
    case CalendarDayType.CancelledDay:
      return "cancelledDay";
    case CalendarDayType.InstructionalDay:
    default:
      return "instructionalDay";
  }
};

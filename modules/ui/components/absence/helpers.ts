import { DayPart, Absence } from "graphql/server-types.gen";

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

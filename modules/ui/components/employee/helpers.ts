import { GetEmployeeAbsenceSchedule } from "./graphql/get-employee-absence-schedule.gen";
import { DayPart, Absence } from "graphql/server-types.gen";
import { parseISO, format } from "date-fns";

export type EmployeeAbsenceDetail = {
  id: string;
  absenceReason: string;
  startDate: Date;
  endDate: Date;
  numDays: number;
  dayPart: DayPart;
  totalDayPortion: number;
  startTime: string;
  startTimeLocal: Date;
  endTime: string;
  endTimeLocal: Date;
  subRequired: boolean;
  substitute?: {
    name: string;
    phoneNumber?: string | null | undefined;
  };
};

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
      };
    }
  );
};

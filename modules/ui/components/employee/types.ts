import { DayPart, CalendarDayType } from "graphql/server-types.gen";

export interface ScheduleDateGroupByMonth {
  month: string;
  scheduleDates: ScheduleDate[];
}

export type EmployeeAbsenceDetail = {
  id: string;
  absenceReason: string;
  startDate: Date;
  endDate: Date;
  numDays: number;
  startTime: string;
  startTimeLocal: Date;
  endTime: string;
  endTimeLocal: Date;
  subRequired: boolean;
  assignments: EmployeeAbsenceAssignment[];
  isFilled: boolean;
  isPartiallyFilled: boolean;
  allDays: Date[];
  allDayParts: {
    dayPart: DayPart;
    dayPortion: number;
    hourDuration: number;
  }[];
};

export type EmployeeAbsenceAssignment = {
  employeeId: string;
  name: string;
  phoneNumber?: string | null | undefined;
  allDates: Date[];
};

export type ContractDate = {
  date: Date;
  calendarDayType: CalendarDayType;
  hasCalendarChange: boolean;
  calendarChangeDescription?: string;
  calendarChangeReasonName?: string;
  startDate?: Date;
  endDate?: Date;
};

export type PositionScheduleDate = {
  position: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  nonStandardVariantTypeName?: string;
};

export type ScheduleDate = {
  date: Date;
  type:
    | "absence"
    | "vacancy"
    | "instructionalDay"
    | "nonWorkDay"
    | "teacherWorkDay"
    | "cancelledDay";
  description?: string;
  rawData: EmployeeAbsenceDetail | ContractDate | PositionScheduleDate;
};

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
  allDays: Date[];
};

export type ContractDate = {
  date: Date;
  calendarDayType: CalendarDayType;
};

export type PositionScheduleDate = {
  position: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
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

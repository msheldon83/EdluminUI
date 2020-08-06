import {
  DayPart,
  CalendarDayType,
  ApprovalStatus,
} from "graphql/server-types.gen";

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
  multipleSubsAssigned: boolean;
  allDays: Date[];
  allDayParts: {
    dayPart: DayPart;
    dayPortion: number;
    hourDuration: number;
  }[];
  approvalStatus: ApprovalStatus;
};

export type EmployeeAbsenceAssignment = {
  employeeId: string;
  name: string;
  phoneNumber?: string | null | undefined;
  allDates: Date[];
  verifiedAtUtc?: Date;
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

export type CalendarScheduleDate = {
  date: Date;
  absences: EmployeeAbsenceDetail[];
  closedDays: ContractDate[];
  modifiedDays: PositionScheduleDate[];
  contractInstructionalDays: ContractDate[];
  inServiceDays: ContractDate[];
  nonWorkDays: ContractDate[];
};

export type AbsenceScheduleDate = {
  date: Date;
  type: "absence" | "pendingAbsence" | "deniedAbsence";
  description?: string;
  rawData: EmployeeAbsenceDetail;
};

export type VacancyScheduleDate = {
  date: Date;
  type: "vacancy";
  description?: string;
  rawData: EmployeeAbsenceDetail | ContractDate | PositionScheduleDate;
};

export type InstructionalScheduleDate = {
  date: Date;
  type: "instructionalDay";
  description?: string;
  rawData: PositionScheduleDate;
};

export type OtherScheduleDate = {
  date: Date;
  type: "nonWorkDay" | "teacherWorkDay" | "cancelledDay";
  description?: string;
  rawData: ContractDate;
};

export type ScheduleDate =
  | AbsenceScheduleDate
  | VacancyScheduleDate
  | InstructionalScheduleDate
  | OtherScheduleDate;

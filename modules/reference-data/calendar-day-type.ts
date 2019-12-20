import { CalendarDayType } from "graphql/server-types.gen";

export const CalendarDayTypes: {
  enumValue: CalendarDayType;
  name: string;
}[] = [
  {
    enumValue: "CANCELLED_DAY" as CalendarDayType,
    name: "Cancelled Day",
  },
  {
    enumValue: "INSTRUCTIONAL_DAY" as CalendarDayType,
    name: "Instructional Day",
  },
  { enumValue: "NON_WORK_DAY" as CalendarDayType, name: "Non-work Day" },
  {
    enumValue: "TEACHER_WORK_DAY" as CalendarDayType,
    name: "Teacher Work Day",
  },
];
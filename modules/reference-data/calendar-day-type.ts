import { CalendarDayType } from "graphql/server-types.gen";

export const CalendarDayTypes: {
  enumValue: CalendarDayType;
  name: string;
}[] = [
  {
    enumValue: CalendarDayType.CancelledDay,
    name: "Unscheduled Day Off",
  },
  {
    enumValue: CalendarDayType.InstructionalDay,
    name: "Instructional Day",
  },
  {
    enumValue: CalendarDayType.NonWorkDay,
    name: "Scheduled Day Off",
  },
  {
    enumValue: CalendarDayType.TeacherWorkDay,
    name: "Teacher Work Day",
  },
];

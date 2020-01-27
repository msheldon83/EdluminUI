import { DayOfWeek } from "graphql/server-types.gen";

export type Period = {
  locationId: string;
  bellScheduleId: string | null | undefined;
  startTime: string;
  endTime: string;
  startPeriodId?: string;
  endPeriodId?: string;
  allDay: boolean;
};

export type Schedule = {
  periods: Period[];
  daysOfTheWeek: DayOfWeek[];
};

export const buildNewSchedule = (
  daysSelected: boolean,
  allDay: boolean
): Schedule => {
  return {
    periods: [buildNewPeriod(allDay)],
    daysOfTheWeek: buildDaysOfTheWeek(daysSelected),
  };
};

export const buildNewPeriod = (allDay: boolean): Period => {
  return {
    locationId: "",
    bellScheduleId: "",
    startTime: "8:30 AM",
    endTime: "3:30 PM",
    allDay: allDay,
  };
};

const buildDaysOfTheWeek = (defaultSelected: boolean): DayOfWeek[] => {
  if (defaultSelected) {
    return [
      DayOfWeek.Monday,
      DayOfWeek.Tuesday,
      DayOfWeek.Wednesday,
      DayOfWeek.Thursday,
      DayOfWeek.Friday,
    ];
  } else {
    return [];
  }
};

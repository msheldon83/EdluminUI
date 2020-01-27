import { DayOfWeek } from "graphql/server-types.gen";

export type Period = {
  locationId: string;
  bellScheduleId: string;
  startTime: string;
  endTime: string;
  startPeriodId?: string;
  endPeriodId?: string;
};

export type Schedule = {
  periods: Period[];
  daysOfTheWeek: DayOfWeek[];
};

export const buildNewSchedule = (daysSelected: boolean): Schedule => {
  return {
    periods: [buildNewPeriod()],
    daysOfTheWeek: buildDaysOfTheWeek(daysSelected),
  };
};

export const buildNewPeriod = (): Period => {
  return {
    locationId: "",
    bellScheduleId: "",
    startTime: "8:30 AM",
    endTime: "3:30 PM",
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

import { DayOfWeek } from "graphql/server-types.gen";

export type Period = {
  locationId: string;
  bellScheduleId: string | null | undefined;
  startTime?: string | null | undefined;
  endTime?: string | null | undefined;
  startPeriodId?: string | null | undefined;
  endPeriodId?: string | null | undefined;
  allDay: boolean;
};

export type Schedule = {
  id?: string | null | undefined;
  periods: Period[];
  daysOfTheWeek: Array<DayOfWeek>;
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
    bellScheduleId: null,
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

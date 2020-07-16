import { DayOfWeek } from "graphql/server-types.gen";

export type Period = {
  locationId: string;
  locationGroupId?: string;
  bellScheduleId: string | null | undefined;
  startTime?: string | null | undefined;
  endTime?: string | null | undefined;
  startPeriodId?: string | null | undefined;
  endPeriodId?: string | null | undefined;
  allDay?: boolean;
  overMidnightConfirmed: boolean;
};

export type Schedule = {
  id?: string | null | undefined;
  periods: Period[];
  daysOfTheWeek: Array<DayOfWeek | null>;
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
    locationGroupId: "",
    bellScheduleId: null,
    allDay: allDay,
  };
};

export const buildDaysOfTheWeek = (defaultSelected: boolean): DayOfWeek[] => {
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

export const GetError = (
  errors: any,
  fieldName: string,
  periodIndex: number,
  scheduleIndex: number
) => {
  
  if (!errors.schedules || !errors.schedules[scheduleIndex]) {
    return undefined;
  }

  if (!errors.schedules[scheduleIndex].periods[periodIndex]) {
    return undefined;
  }

  const periodError = errors.schedules[scheduleIndex].periods[periodIndex];
  if (!periodError) {
    return undefined;
  }

  if (!periodError[fieldName]) {
    return undefined;
  }

  const errorMessage: string = periodError[fieldName];
  return errorMessage;
};

import { TFunction } from "i18next";
import {
  WorkDaySchedulePeriodInput,
  Maybe,
  WorkDayScheduleVariantInput,
} from "graphql/server-types.gen";
import { midnightTime, timeStampToIso } from "helpers/time";
import { isValid, differenceInMinutes, addMinutes } from "date-fns";

export type ScheduleSettings = {
  isBasic: boolean;
  periodSettings: {
    numberOfPeriods: number;
  };
};

export type Period = {
  periodId?: string | null | undefined;
  variantPeriodId?: string | null | undefined;
  name?: string;
  placeholder: string;
  startTime?: string;
  endTime?: string;
  isHalfDayMorningEnd?: boolean;
  isHalfDayAfternoonStart?: boolean;
  skipped: boolean;
  sequence?: number;
};

export const BuildPeriodsFromScheduleSettings = (
  settings: ScheduleSettings,
  useHalfDayBreaks: boolean,
  t: TFunction
): Array<Period> => {
  const periods: Array<Period> = [];

  if (settings.isBasic) {
    // Basic Schedule
    periods.push({
      placeholder: t("Morning"),
      startTime: undefined,
      endTime: undefined,
      skipped: false,
    });
    periods.push({
      placeholder: t("Afternoon"),
      startTime: undefined,
      endTime: undefined,
      skipped: false,
    });
  } else {
    // Period Schedule
    for (let i = 0; i < settings.periodSettings.numberOfPeriods; i++) {
      periods.push({
        placeholder: `${t("Period")} ${i + 1}`,
        startTime: undefined,
        endTime: undefined,
        skipped: false,
      });
    }
  }

  // If using Half Day Breaks, add one into the list
  if (useHalfDayBreaks) {
    const middleIndex = Math.ceil(periods.length / 2);
    periods.splice(middleIndex, 0, {
      placeholder: t("Lunch"),
      startTime: undefined,
      endTime: undefined,
      isHalfDayAfternoonStart: true,
      skipped: false,
    });
    periods[middleIndex - 1].isHalfDayMorningEnd = true;
  }

  return periods;
};

export const BuildPeriodsFromSchedule = (
  periods: Array<Maybe<WorkDaySchedulePeriodInput>>,
  variant: WorkDayScheduleVariantInput | null | undefined,
  useHalfDayBreaks: boolean,
  standardSchedule: WorkDayScheduleVariantInput | null | undefined
) => {
  const schedulePeriods = periods.map(p => {
    const period = p as WorkDaySchedulePeriodInput;
    const variantPeriod =
      variant && variant.periods
        ? variant.periods.find(
            vp => vp!.workDaySchedulePeriodName === period.name
          )
        : null;

    return {
      name: period.name || "",
      placeholder: "",
      startTime:
        variantPeriod && variantPeriod.startTime
          ? timeStampToIso(midnightTime().setSeconds(variantPeriod.startTime))
          : undefined,
      endTime:
        variantPeriod && variantPeriod.endTime
          ? timeStampToIso(midnightTime().setSeconds(variantPeriod.endTime))
          : undefined,
      isHalfDayMorningEnd:
        variantPeriod != null && (variantPeriod?.isHalfDayMorningEnd || false),
      isHalfDayAfternoonStart:
        variantPeriod != null &&
        (variantPeriod?.isHalfDayAfternoonStart || false),
      skipped: false,
    };
  });

  if (useHalfDayBreaks) {
    // Default Half Day Morning End and Half Day Afternoon Start if not set
    const currentHalfDayMorningEnd = schedulePeriods.find(
      p => p.isHalfDayMorningEnd
    );
    const currentHalfDayAfternoonStart = schedulePeriods.find(
      p => p.isHalfDayAfternoonStart
    );
    if (
      !currentHalfDayMorningEnd &&
      !currentHalfDayAfternoonStart &&
      standardSchedule &&
      standardSchedule.periods
    ) {
      const halfDayAfternoonStartIndex = standardSchedule.periods.findIndex(
        p => p!.isHalfDayAfternoonStart
      );
      const halfDayMorningEndIndex = standardSchedule.periods.findIndex(
        p => p!.isHalfDayMorningEnd
      );
      schedulePeriods[
        halfDayAfternoonStartIndex
      ].isHalfDayAfternoonStart = true;
      schedulePeriods[halfDayMorningEndIndex].isHalfDayMorningEnd = true;
    }
  }

  return schedulePeriods;
};

export const GetPeriodDurationInMinutes = (
  startTime: string | undefined,
  endTime: string | undefined,
  travelDuration: number,
  showTravelDuration: boolean,
  t: TFunction
) => {
  if (!startTime || !endTime) {
    return null;
  }

  const startTimeDate = new Date(startTime);
  const endTimeDate = new Date(endTime);
  if (!isValid(startTimeDate) || !isValid(endTimeDate)) {
    return null;
  }

  // As the TimeInput is changing, the value may not be a date string yet
  // and just a number (i.e. "10" for 10:00 am). Since we enforce "earliestTime" on
  // the TimeInput, endTime should never be before startTime so just bail out here
  // and wait till we have a valid date string
  if (endTimeDate < startTimeDate) {
    return null;
  }

  const minutes = differenceInMinutes(endTimeDate, startTimeDate);
  if (typeof minutes !== "number" || isNaN(minutes)) {
    return null;
  }

  const travelDurationString = ` (+${travelDuration}) `;
  const minutesDisplay = `${minutes}${
    showTravelDuration ? travelDurationString : " "
  }${t("minutes")}`;
  return minutesDisplay;
};

export const RemovePeriod = (
  periods: Array<Period>,
  index: number,
  t: TFunction
) => {
  const periodItems = [...periods];
  const [removed] = periodItems.splice(index, 1);

  // Preserve a half day break
  if (removed.isHalfDayAfternoonStart || removed.isHalfDayMorningEnd) {
    let currentIndex = index;
    if (currentIndex === periodItems.length) {
      // Last period has been deleted
      currentIndex = currentIndex - 1;
    }
    const hasNextPeriod = periodItems[currentIndex + 1] != null;
    const hasPreviousPeriod = periodItems[currentIndex - 1] != null;
    if (removed.isHalfDayAfternoonStart) {
      const halfDayAfternoonStartIndex = hasPreviousPeriod
        ? currentIndex
        : currentIndex + 1;
      periodItems[halfDayAfternoonStartIndex].isHalfDayAfternoonStart = true;
      periodItems[halfDayAfternoonStartIndex].isHalfDayMorningEnd = false;
      periodItems[halfDayAfternoonStartIndex - 1].isHalfDayMorningEnd = true;
    } else if (removed.isHalfDayMorningEnd) {
      const halfDayMorningEndIndex = hasNextPeriod
        ? currentIndex
        : currentIndex - 1;
      periodItems[halfDayMorningEndIndex].isHalfDayMorningEnd = true;
      periodItems[halfDayMorningEndIndex].isHalfDayAfternoonStart = false;
      periodItems[halfDayMorningEndIndex + 1].isHalfDayAfternoonStart = true;
    }
  }

  UpdatePeriodPlaceholders(periodItems, t);
  return periodItems;
};

export const SkipPeriod = (periods: Array<Period>, index: number) => {
  const periodItems = [...periods];
  const skippedPeriod = periodItems[index];
  skippedPeriod.skipped = true;

  const sortedPeriods = periodItems.sort(
    (a, b) => (a.skipped ? 1 : 0) - (b.skipped ? 1 : 0)
  );

  // Preserve the half day break
  if (skippedPeriod.isHalfDayAfternoonStart) {
    skippedPeriod.isHalfDayAfternoonStart = false;
    const endOfMorningPeriodIndex = sortedPeriods.findIndex(
      p => p.isHalfDayMorningEnd
    );
    const activePeriods = sortedPeriods.filter(s => !s.skipped);
    if (endOfMorningPeriodIndex === activePeriods.length - 1) {
      sortedPeriods[endOfMorningPeriodIndex].isHalfDayAfternoonStart = true;
      sortedPeriods[endOfMorningPeriodIndex].isHalfDayMorningEnd = false;
      sortedPeriods[
        endOfMorningPeriodIndex - 1
      ].isHalfDayAfternoonStart = false;
      sortedPeriods[endOfMorningPeriodIndex - 1].isHalfDayMorningEnd = true;
    } else {
      sortedPeriods[endOfMorningPeriodIndex + 1].isHalfDayAfternoonStart = true;
    }
  } else if (skippedPeriod.isHalfDayMorningEnd) {
    skippedPeriod.isHalfDayMorningEnd = false;
    const startOfAfternoonPeriodIndex = sortedPeriods.findIndex(
      p => p.isHalfDayAfternoonStart
    );
    if (startOfAfternoonPeriodIndex === 0) {
      sortedPeriods[0].isHalfDayMorningEnd = true;
      sortedPeriods[0].isHalfDayAfternoonStart = false;
      sortedPeriods[1].isHalfDayMorningEnd = false;
      sortedPeriods[1].isHalfDayAfternoonStart = true;
    } else {
      sortedPeriods[startOfAfternoonPeriodIndex - 1].isHalfDayMorningEnd = true;
    }
  }

  return sortedPeriods;
};

export const UnskipPeriod = (periods: Array<Period>, index: number) => {
  const periodItems = [...periods];
  periodItems[index].skipped = false;
  return periodItems;
};

export const AddPeriod = (
  periods: Array<Period>,
  travelDuration: number,
  t: TFunction
) => {
  const placeholder = `${t("Period")} ${periods.length + 1}`;
  const previousPeriod = periods[periods.length - 1];
  const defaultStartTime =
    previousPeriod && previousPeriod.endTime
      ? addMinutes(
          new Date(previousPeriod.endTime),
          travelDuration
        ).toISOString()
      : undefined;
  const periodItems = [
    ...periods,
    {
      placeholder,
      startTime: defaultStartTime,
      endTime: undefined,
      skipped: false,
    },
  ];

  UpdatePeriodPlaceholders(periodItems, t);
  return periodItems;
};

export const UpdatePeriodPlaceholders = (
  periods: Array<Period>,
  t: TFunction
) => {
  const halfDayBreakPeriod = periods.find(p => p.isHalfDayAfternoonStart);

  if (
    halfDayBreakPeriod &&
    periods.length === 3 &&
    periods[1].isHalfDayAfternoonStart
  ) {
    periods[0].placeholder = t("Morning");
    periods[2].placeholder = t("Afternoon");
  } else if (!halfDayBreakPeriod && periods.length === 2) {
    periods[0].placeholder = t("Morning");
    periods[1].placeholder = t("Afternoon");
  } else {
    let periodNumber = 1;
    periods.forEach(p => {
      if (!p.isHalfDayAfternoonStart) {
        p.placeholder = `${t("Period")} ${periodNumber++}`;
      }
    });
  }

  if (halfDayBreakPeriod) {
    halfDayBreakPeriod.placeholder = t("Lunch");
  }
};

export const GetError = (errors: any, fieldName: string, index: number) => {
  if (!errors.periods || !errors.periods[index]) {
    return null;
  }

  const periodError = errors.periods[index];
  if (!periodError) {
    return null;
  }

  if (!periodError[fieldName]) {
    return null;
  }

  const errorMessage: string = periodError[fieldName];
  return errorMessage;
};

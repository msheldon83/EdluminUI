import { TFunction } from "i18next";
import { isValid, differenceInMinutes, addMinutes, parseISO } from "date-fns";
import { tryDateFromString, tryDifferenceInMinutes } from "helpers/date";

export type ScheduleSettings = {
  isBasic: boolean;
  periodSettings: {
    numberOfPeriods: number;
  };
};

export type BellSchedule = {
  name: string;
  externalId?: string | null | undefined;
  standard: Variant | undefined;
  variants: Variant[];
  locationIds: string[] | undefined;
  locationGroupIds: string[] | undefined;
};

export type Variant = {
  periods: Period[];
  workDayScheduleVariantTypeId: string;
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
  isEndOfDayPeriod?: boolean;
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
  periods: Period[],
  variant: Variant | null,
  useHalfDayBreaks: boolean,
  standardSchedule: Variant
): Period[] => {
  const schedulePeriods = periods.map(p => {
    const variantPeriod =
      variant && variant.periods
        ? variant.periods.find(vp => vp.name === p.name)
        : null;

    return {
      name: p.name || "",
      placeholder: p.placeholder,
      startTime:
        variantPeriod && variantPeriod.startTime
          ? parseISO(variantPeriod.startTime).toISOString()
          : undefined,
      endTime:
        variantPeriod && variantPeriod.endTime
          ? parseISO(variantPeriod.endTime).toISOString()
          : undefined,
      isHalfDayMorningEnd:
        variantPeriod != null && (variantPeriod?.isHalfDayMorningEnd || false),
      isHalfDayAfternoonStart:
        variantPeriod != null &&
        (variantPeriod?.isHalfDayAfternoonStart || false),
      skipped: false,
      isEndOfDayPeriod: p.isEndOfDayPeriod,
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
        p => p.isHalfDayAfternoonStart
      );
      const halfDayMorningEndIndex = standardSchedule.periods.findIndex(
        p => p.isHalfDayMorningEnd
      );
      schedulePeriods[
        halfDayAfternoonStartIndex
      ].isHalfDayAfternoonStart = true;
      schedulePeriods[halfDayMorningEndIndex].isHalfDayMorningEnd = true;
    }
  }

  return schedulePeriods;
};

export const travelDurationFromPeriods = (
  periods: Period[],
  currentPeriod: Period,
  currentIndex: number
) => {
  const isLastPeriod = currentIndex + 1 >= periods.length;
  const nextPeriod = isLastPeriod ? undefined : periods[currentIndex + 1];

  const travelEnd = tryDateFromString(nextPeriod?.startTime);
  const travelStart = tryDateFromString(currentPeriod.endTime);

  return tryDifferenceInMinutes(travelEnd, travelStart);
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

  // Move the half day break flags
  if (removed.isHalfDayAfternoonStart || removed.isHalfDayMorningEnd) {
    let currentIndex = index;
    if (currentIndex === periodItems.length) {
      // Last period has been deleted
      currentIndex = currentIndex - 1;
    }
    if (removed.isHalfDayAfternoonStart) {
      periodItems[currentIndex].isHalfDayAfternoonStart = true;
    }
    if (removed.isHalfDayMorningEnd) {
      periodItems[currentIndex].isHalfDayMorningEnd = true;
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

  // Move the half day break flags
  if (skippedPeriod.isHalfDayAfternoonStart) {
    skippedPeriod.isHalfDayAfternoonStart = false;
    if (sortedPeriods[index].skipped) {
      sortedPeriods[index - 1].isHalfDayAfternoonStart = true;
    } else {
      sortedPeriods[index].isHalfDayAfternoonStart = true;
    }
  }

  if (skippedPeriod.isHalfDayMorningEnd) {
    skippedPeriod.isHalfDayMorningEnd = false;
    if (sortedPeriods[index].skipped) {
      sortedPeriods[index - 1].isHalfDayMorningEnd = true;
    } else {
      sortedPeriods[index].isHalfDayMorningEnd = true;
    }
  }

  return sortedPeriods;
};

export const UnskipPeriod = (periods: Array<Period>, index: number) => {
  const periodItems = [...periods];
  periodItems[index].skipped = false;

  // If we only have a single period, default it to both
  // end of morning and start of afternoon
  if (periodItems.filter(p => !p.skipped).length === 1) {
    periodItems[index].isHalfDayMorningEnd = true;
    periodItems[index].isHalfDayAfternoonStart = true;
  }

  // Re sort periods to make sure the Skipped stay at the bottom of the list
  const sortedPeriods = periods.sort(
    (a, b) =>
      (a.skipped ? 1 : 0) - (b.skipped ? 1 : 0) ||
      (a.sequence || 0) - (b.sequence || 0)
  );

  return sortedPeriods;
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
      travelDuration:
        previousPeriod && previousPeriod.endTime ? travelDuration : 0,
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
  } else if (periods.length === 2) {
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

  if (halfDayBreakPeriod && periods.length !== 2) {
    halfDayBreakPeriod.placeholder = t("Lunch");
  }
};

export const GetTouched = (touched: any, fieldName: string, index: number) => {
  if (!touched?.periods || !touched.periods[index]) {
    return undefined;
  }

  const periodError = touched.periods[index];
  if (!periodError) {
    return undefined;
  }

  if (!periodError[fieldName]) {
    return undefined;
  }

  const errorMessage: boolean = periodError[fieldName];
  return errorMessage;
};

export const GetError = (errors: any, fieldName: string, index: number) => {
  if (!errors.periods || !errors.periods[index]) {
    return undefined;
  }

  const periodError = errors.periods[index];
  if (!periodError) {
    return undefined;
  }

  if (!periodError[fieldName]) {
    return undefined;
  }

  const errorMessage: string = periodError[fieldName];
  return errorMessage;
};

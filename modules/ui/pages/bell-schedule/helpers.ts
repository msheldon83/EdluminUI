import { TFunction } from "i18next";
import {
  WorkDaySchedulePeriodInput,
  Maybe,
  WorkDayScheduleVariantInput,
} from "graphql/server-types.gen";
import { midnightTime, timeStampToIso } from "helpers/time";

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

import { useTranslation } from "react-i18next";
import addMonth from "date-fns/addMonths";
import addWeeks from "date-fns/addWeeks";
import addDays from "date-fns/addDays";
import addYears from "date-fns/addYears";
import startOfWeek from "date-fns/startOfWeek";
import endOfWeek from "date-fns/endOfWeek";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import isBefore from "date-fns/isBefore";
import isSameDay from "date-fns/isSameDay";
import { OptionType } from "../select";

export type DateRange = {
  start: Date;
  end: Date;
};

export type PresetRange = OptionType & {
  range: () => DateRange;
};

const getThisSchoolYearDateRange = () => {
  // january starts at 0
  const SCHOOL_YEAR_START_MONTH_INDEX = 6;
  const SCHOOL_YEAR_END_MONTH_INDEX = 5;

  const today = new Date();
  const year = today.getFullYear();

  const endSchoolYearThisYear = new Date(year, SCHOOL_YEAR_END_MONTH_INDEX);
  const didStartLastYear = isBefore(today, endSchoolYearThisYear);

  const start = new Date(
    didStartLastYear ? year - 1 : year,
    SCHOOL_YEAR_START_MONTH_INDEX
  );
  const end = new Date(
    didStartLastYear ? year : year + 1,
    SCHOOL_YEAR_END_MONTH_INDEX
  );

  return { start: startOfMonth(start), end: endOfMonth(end) };
};

export enum DateRangePreset {
  Last7,
  Last30,
  Today,
  ThisWeek,
  ThisMonth,
  ThisSchoolYear,
  Yesterday,
  LastWeek,
  LastMonth,
  LastSchoolYear,
  Tomorrow,
  NextWeek,
  NextMonth,
  Next7,
}

export const pastPresetDateRanges = [
  DateRangePreset.Yesterday,
  DateRangePreset.LastWeek,
  DateRangePreset.LastMonth,
  DateRangePreset.LastSchoolYear,
];

export const presentPresetDateRanges = [
  DateRangePreset.Today,
  DateRangePreset.Last7,
  DateRangePreset.Last30,
  DateRangePreset.ThisWeek,
  DateRangePreset.ThisMonth,
  DateRangePreset.ThisSchoolYear,
];

export const futurePresetDateRanges = [
  DateRangePreset.Tomorrow,
  DateRangePreset.Next7,
  DateRangePreset.NextWeek,
  DateRangePreset.NextMonth,
];

const defaultPresetDateRanges = [
  DateRangePreset.Today,
  DateRangePreset.Last7,
  DateRangePreset.Last30,
  DateRangePreset.ThisWeek,
  DateRangePreset.ThisMonth,
  DateRangePreset.ThisSchoolYear,
  DateRangePreset.Yesterday,
  DateRangePreset.LastWeek,
  DateRangePreset.LastMonth,
  DateRangePreset.LastSchoolYear,
  DateRangePreset.Tomorrow,
  DateRangePreset.Next7,
  DateRangePreset.NextWeek,
  DateRangePreset.NextMonth,
];

type UsePresetDateRangesParams = {
  presets?: DateRangePreset[];
  filter?: (r: PresetRange) => boolean;
  additionalPresets?: PresetRange[];
};

export const usePresetDateRanges = (
  options?: UsePresetDateRangesParams | undefined
) => {
  const { t } = useTranslation();

  const {
    presets = undefined,
    filter = undefined,
    additionalPresets = undefined,
  } = options ?? {};

  const presetRangeMap: Record<DateRangePreset, PresetRange> = {
    [DateRangePreset.Last7]: {
      label: t("Last 7 days"),
      value: "last-7-days",
      range() {
        // Including Today
        const start = addDays(new Date(), -6);
        const end = new Date();

        return {
          start,
          end,
        };
      },
    },
    [DateRangePreset.Last30]: {
      label: t("Last 30 days"),
      value: "last-30-days",
      range() {
        // Including Today
        const start = addDays(new Date(), -29);
        const end = new Date();

        return {
          start,
          end,
        };
      },
    },
    [DateRangePreset.Today]: {
      label: t("Today"),
      value: "today",
      range() {
        const start = new Date();
        const end = new Date();

        return {
          start,
          end,
        };
      },
    },
    [DateRangePreset.ThisWeek]: {
      label: t("This week"),
      value: "this-week",
      range() {
        const today = new Date();

        return {
          start: startOfWeek(today),
          end: endOfWeek(today),
        };
      },
    },
    [DateRangePreset.ThisMonth]: {
      label: t("This month"),
      value: "this-month",
      range() {
        const today = new Date();

        return {
          start: startOfMonth(today),
          end: endOfMonth(today),
        };
      },
    },
    [DateRangePreset.ThisSchoolYear]: {
      label: t("This school year"),
      value: "this-school-year",
      range: () => getThisSchoolYearDateRange(),
    },
    [DateRangePreset.Yesterday]: {
      label: t("Yesterday"),
      value: "yesterday",
      range() {
        const yesterday = addDays(new Date(), -1);

        return {
          start: yesterday,
          end: yesterday,
        };
      },
    },
    [DateRangePreset.LastWeek]: {
      label: t("Last week"),
      value: "last-week",
      range() {
        const lastWeek = addWeeks(new Date(), -1);

        return {
          start: startOfWeek(lastWeek),
          end: endOfWeek(lastWeek),
        };
      },
    },
    [DateRangePreset.LastMonth]: {
      label: t("Last month"),
      value: "last-month",
      range() {
        const lastMonth = addMonth(new Date(), -1);

        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth),
        };
      },
    },
    [DateRangePreset.LastSchoolYear]: {
      label: t("Last school year"),
      value: "last-school-year",
      range() {
        const thisSchoolYear = getThisSchoolYearDateRange();

        const start = addYears(thisSchoolYear.start, -1);
        const end = addYears(thisSchoolYear.end, -1);

        return {
          start,
          end,
        };
      },
    },
    [DateRangePreset.Tomorrow]: {
      label: t("Tomorrow"),
      value: "tomorrow",
      range() {
        const tomorrow = addDays(new Date(), 1);

        return {
          start: tomorrow,
          end: tomorrow,
        };
      },
    },
    [DateRangePreset.NextWeek]: {
      label: t("Next week"),
      value: "next-week",
      range() {
        const nextWeek = addWeeks(new Date(), 1);

        return {
          start: startOfWeek(nextWeek),
          end: endOfWeek(nextWeek),
        };
      },
    },
    [DateRangePreset.NextMonth]: {
      label: t("Next month"),
      value: "next-month",
      range() {
        const nextMonth = addMonth(new Date(), 1);

        return {
          start: startOfMonth(nextMonth),
          end: endOfMonth(nextMonth),
        };
      },
    },
    [DateRangePreset.Next7]: {
      label: t("Next 7 days"),
      value: "next-7-days",
      range() {
        // Including Today
        const start = new Date();
        const end = addDays(new Date(), 6);

        return {
          start,
          end,
        };
      },
    },
  };

  const presetsToSelect = presets ?? defaultPresetDateRanges;
  const selectedPresets = presetsToSelect.map(p => presetRangeMap[p]);
  const filteredPresetDateRanges = filter
    ? selectedPresets.filter(filter)
    : selectedPresets;

  const finalPresets = filteredPresetDateRanges.concat(additionalPresets ?? []);

  function getPresetByDates(
    startToMatch?: Date,
    endToMatch?: Date
  ): PresetRange | undefined {
    if (startToMatch === undefined || endToMatch === undefined) {
      return undefined;
    }

    return finalPresets.find(presetDateRange => {
      const { start, end } = presetDateRange.range();

      return isSameDay(start, startToMatch) && isSameDay(end, endToMatch);
    });
  }

  return {
    presetDateRanges: finalPresets,
    getPresetByDates,
  };
};

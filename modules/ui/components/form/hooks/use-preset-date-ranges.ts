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

export const usePresetDateRanges = (additionalPresets?: PresetRange[]) => {
  const { t } = useTranslation();

  const presetDateRanges = ([
    {
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
    {
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
    {
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
    {
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
    {
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
    {
      label: t("This school year"),
      value: "this-school-year",
      range: () => getThisSchoolYearDateRange(),
    },
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
  ] as PresetRange[]).concat(additionalPresets ?? []);

  function getPresetByDates(
    startToMatch?: Date,
    endToMatch?: Date
  ): PresetRange | undefined {
    if (startToMatch === undefined || endToMatch === undefined) {
      return undefined;
    }

    return presetDateRanges.find(presetDateRange => {
      const { start, end } = presetDateRange.range();

      return isSameDay(start, startToMatch) && isSameDay(end, endToMatch);
    });
  }

  return {
    presetDateRanges,
    getPresetByDates,
  };
};

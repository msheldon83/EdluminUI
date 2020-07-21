import * as React from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import addMonth from "date-fns/addMonths";
import isBefore from "date-fns/isBefore";
import isAfter from "date-fns/isAfter";
import isWithinInterval from "date-fns/isWithinInterval";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import { DateInput } from "./date-input";
import { CustomCalendar as Calendar, CustomDate } from "./custom-calendar";
import { SelectNew as Select, OptionType } from "./select-new";
import {
  usePresetDateRanges,
  PresetRange,
  DateRange,
} from "./hooks/use-preset-date-ranges";
import {
  maxOfDates,
  minOfDates,
  eachDayOfInterval,
  isBeforeOrEqual,
  isAfterDate,
} from "helpers/date";
import { useIsMount } from "hooks/use-is-mount";

export type DateRangePickerProps = {
  startDate?: Date;
  endDate?: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onDateRangeSelected: (start: Date, end: Date) => void;
  defaultMonth?: Date;
  additionalPresets?: PresetRange[];
  contained?: boolean;
};

export const DateRangePicker = React.memo((props: DateRangePickerProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    onDateRangeSelected,
    defaultMonth = new Date(),
    additionalPresets,
    startDate,
    endDate,
    minimumDate,
    maximumDate,
    contained = false,
  } = props;

  const { presetDateRanges, getPresetByDates } = usePresetDateRanges(
    additionalPresets
  );

  const [startMonth, setStartMonth] = React.useState(defaultMonth);
  const [selectedDates, setSelectedDates] = React.useState<CustomDate[]>([]);
  const [highlightedDates, setHighlightedDates] = React.useState<CustomDate[]>(
    []
  );
  const [startDateInput, setStartDateInput] = React.useState<
    Date | string | undefined
  >();
  const [endDateInput, setEndDateInput] = React.useState<
    Date | string | undefined
  >();
  const [selectedPreset, setSelectedPreset] = React.useState<
    PresetRange | undefined
  >(getPresetByDates(startDate, endDate));

  const constrainedDates = React.useMemo(
    () => (start: Date, end: Date) => {
      const constrainedStart = maxOfDates([start, minimumDate]);
      const constrainedEnd = minOfDates([end, maximumDate]);

      return [constrainedStart, constrainedEnd];
    },
    [maximumDate, minimumDate]
  );

  const setRange = React.useCallback(
    ({ start, end }: DateRange, ignoreVisibilityTrigger?: boolean) => {
      // Adjust values for max and min dates so that the selection never goes out of the range
      const [constrainedStart, constrainedEnd] = constrainedDates(start, end);

      const selectedDates = eachDayOfInterval({
        start: constrainedStart,
        end: constrainedEnd,
      }).map(date => {
        return {
          date,
          buttonProps: {
            style: {
              background: theme.calendar.selected,
              color: theme.customColors.white,
            },
          },
        };
      });

      const endMonth = addMonth(startMonth, 1);
      const startMonthDate = startOfMonth(startMonth);
      const endMonthDate = endOfMonth(endMonth);

      const endDateVisible = isWithinInterval(constrainedEnd, {
        start: startMonthDate,
        end: endMonthDate,
      });

      // End date of range will show on the left side
      if (!ignoreVisibilityTrigger && !endDateVisible) {
        setStartMonth(constrainedEnd);
      }

      // End date of range will show on the right side
      if (
        !ignoreVisibilityTrigger &&
        !endDateVisible &&
        isBefore(startMonthDate, constrainedEnd)
      ) {
        setStartMonth(addMonth(constrainedEnd, -1));
      }

      setSelectedDates(selectedDates);

      setStartDateInput(constrainedStart);
      setEndDateInput(constrainedEnd);

      onDateRangeSelected(constrainedStart, constrainedEnd);
    },
    [
      onDateRangeSelected,
      startMonth,
      theme.calendar.selected,
      theme.customColors.white,
      constrainedDates,
    ]
  );

  const resetSelectedPreset = React.useCallback(() => {
    if (typeof startDateInput == "string" || typeof endDateInput === "string") {
      return;
    }

    const preset = getPresetByDates(startDateInput, endDateInput);

    if (!preset) {
      return setSelectedPreset(undefined);
    }

    if (preset?.value === selectedPreset?.value) {
      return;
    }

    setSelectedPreset(preset);
  }, [endDateInput, startDateInput, getPresetByDates, selectedPreset?.value]);

  // Make sure that if a preset is selected it shows when the popover is closed then repoened
  React.useEffect(() => resetSelectedPreset(), [
    resetSelectedPreset,
    startDateInput,
    endDateInput,
  ]);

  // Keeps things in sync with date ranges from the parent
  const isMount = useIsMount();
  React.useEffect(() => {
    if (startDate !== undefined && endDate !== undefined) {
      /*
        This sets the range, but doesn't force the month view to scroll to the first
        visible date unless it's the initial mounting of the component. On the initial
        mount of the component, the already selected dates should be made visible. But,
        if the user needs to scroll to other months, it shouldn't force dates to be visible.
      */
      setRange({ start: startDate, end: endDate }, !isMount);
    }
  }, [startDate, endDate, setRange, constrainedDates, isMount]);

  const handleMonthChange = (month: Date) => setStartMonth(month);

  const clearRange = () => {
    setSelectedDates([]);
    setHighlightedDates([]);

    setStartDateInput("");
    setEndDateInput("");
  };

  const restartRange = (date: Date) => setRange({ start: date, end: date });

  const handleDateClick = (date: Date) => {
    // Any change to the calendar should reset the preset dropdown
    resetSelectedPreset();

    setHighlightedDates([]);

    const start = selectedDates[0]?.date;
    const end = selectedDates[selectedDates.length - 1]?.date;

    const dateIsAfterStart =
      start !== undefined && end !== undefined && isBefore(start, date);
    const isOutsideStartAndEnd =
      start !== undefined &&
      end !== undefined &&
      isAfter(end, start) &&
      !isWithinInterval(date, { start, end });

    // Start the range picking over if the user has selected a range and it's
    // clicked outside
    if (isOutsideStartAndEnd || !dateIsAfterStart) {
      return restartRange(date);
    }

    // Start picking the range
    if (selectedDates.length === 0) {
      return handleStartDateInputChange(date);
    }

    // Set end date
    return handleEndDateInputChange(date);
  };

  const generateHighlightedDates = (start?: Date, end?: Date) => {
    return start !== undefined && end !== undefined
      ? eachDayOfInterval({ start, end }).map(date => {
          return {
            date,
            buttonProps: {
              style: {
                backgroundColor: theme.customColors.lightGray,
              },
            },
          };
        })
      : [];
  };

  const handleDateHover = (date: Date) => {
    // When there is no start date, there's no need to create a highlighted range.
    if (!startDate) {
      return;
    }

    const start = selectedDates[0]?.date;
    const dateIsBefore = start !== undefined && isBefore(date, start);
    const hasRange = selectedDates.length > 1;

    // If the user hovers over a date before the selected start date
    // There's no need to highlight
    if (dateIsBefore || hasRange) {
      setHighlightedDates([]);
      return;
    }

    // Make sure that the dates out of range never get highlighted
    const [highlightedStart, highlightedEnd] = constrainedDates(
      selectedDates[0]?.date,
      date
    );

    const newHighlightedDates = generateHighlightedDates(
      highlightedStart,
      highlightedEnd
    );

    setHighlightedDates(newHighlightedDates);
  };

  const handleCalendarMouseLeave = () => {
    setHighlightedDates([]);
  };

  const handleStartDateInputChange = (start: Date) => {
    const end = selectedDates[selectedDates.length - 1]?.date ?? start;

    setRange({ start, end });
    resetSelectedPreset();
  };

  const handleEndDateInputChange = (end: Date) => {
    const start = selectedDates[0]?.date ?? end;

    setRange({ start, end });
    resetSelectedPreset();
  };

  const handlePresetChange = (selection: OptionType) => {
    // Reset
    if (!selection || selection.label === "-") {
      clearRange();
      return;
    }

    const presetRange = selection as PresetRange;

    const { start, end } = presetRange.range();

    setSelectedPreset(presetRange);
    setRange({ start, end });
  };

  const calendarDates = React.useMemo(() => {
    return selectedDates.concat(highlightedDates);
  }, [selectedDates, highlightedDates]);

  const containerClasses = clsx({
    [classes.contained]: contained,
  });

  const filteredPresetDateRanges = React.useMemo(() => {
    return presetDateRanges.filter(preset => {
      const { start, end } = preset.range();
      const rangeIsBeforeMinDate =
        isAfterDate(minimumDate, start) && isAfterDate(minimumDate, end);
      const rangeIsAfterMaxDate =
        isAfterDate(start, maximumDate) && isAfterDate(end, maximumDate);

      return !rangeIsBeforeMinDate && !rangeIsAfterMaxDate;
    });
  }, [presetDateRanges, minimumDate, maximumDate]);

  return (
    <div className={containerClasses}>
      <div className={classes.dateRangeSelectContainer}>
        <Select
          value={selectedPreset}
          options={filteredPresetDateRanges}
          label={t("Date Range")}
          multiple={false}
          onChange={handlePresetChange}
          readOnly
          renderInputValue={() => {
            return selectedPreset?.label ?? "";
          }}
        />
      </div>
      <div className={classes.dateInputContainer}>
        <DateInput
          value={startDateInput}
          className={classes.startDateInput}
          onChange={setStartDateInput}
          onValidDate={handleStartDateInputChange}
          label={t("From")}
        />

        <DateInput
          value={endDateInput}
          className={classes.endDateInput}
          onChange={setEndDateInput}
          onValidDate={handleEndDateInputChange}
          label={t("To")}
        />
      </div>
      <div className={classes.calendarsContainer}>
        <div className={classes.startCalender}>
          <Calendar
            contained={false}
            month={startMonth}
            variant="month"
            previousMonthNavigation
            onMonthChange={handleMonthChange}
            customDates={calendarDates}
            onClickDate={handleDateClick}
            onHoverDate={handleDateHover}
            onMouseLeave={handleCalendarMouseLeave}
            maximumDate={maximumDate}
            minimumDate={minimumDate}
          />
        </div>
        <div className={classes.endCalendar}>
          <Calendar
            contained={false}
            month={addMonth(startMonth, 1)}
            variant="month"
            nextMonthNavigation
            onMonthChange={(month: Date) => {
              // This would force the months to jump by 2 because it's the calendar
              // on the right side. So, the code makes sure it only moves forward by
              // 1 month
              handleMonthChange(addMonth(month, -1));
            }}
            customDates={calendarDates}
            onClickDate={handleDateClick}
            onHoverDate={handleDateHover}
            onMouseLeave={handleCalendarMouseLeave}
            maximumDate={maximumDate}
            minimumDate={minimumDate}
          />
        </div>
      </div>
    </div>
  );
});

const useStyles = makeStyles(theme => ({
  contained: {
    border: `1px solid ${theme.customColors.edluminSubText}`,
    borderRadius: theme.typography.pxToRem(4),
    padding: theme.spacing(3),
  },
  dateRangeSelectContainer: {
    paddingBottom: theme.spacing(1.5),
  },
  dateInputContainer: {
    display: "flex",
    paddingBottom: theme.spacing(2),
  },

  calendarsContainer: {
    backgroundColor: theme.customColors.white,
    borderRadius: theme.typography.pxToRem(4),
    display: "flex",
    marginBottom: theme.spacing(2),
  },
  startCalender: {
    flex: "1 0 auto",
    paddingRight: theme.spacing(4),
  },
  endCalendar: {
    flex: "1 0 auto",
  },
  startDateInput: {
    marginRight: theme.spacing(2),
  },
  endDateInput: {},
}));

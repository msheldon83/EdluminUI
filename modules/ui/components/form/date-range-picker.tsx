import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import addMonth from "date-fns/addMonths";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
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

type DateRangePickerProps = {
  startDate?: Date;
  endDate?: Date;
  onDateRangeSelected: (start: Date, end: Date) => void;
  defaultMonth?: Date;
  additionalPresets?: PresetRange[];
};

export const DateRangePicker = (props: DateRangePickerProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    onDateRangeSelected,
    defaultMonth = new Date(),
    additionalPresets,
    startDate,
    endDate,
  } = props;

  const presetRanges = usePresetDateRanges(additionalPresets);

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
  >();

  const resetSelectedPreset = () => setSelectedPreset(undefined);

  const handleMonthChange = (month: Date) => setStartMonth(month);

  const clearRange = () => {
    setSelectedDates([]);
    setHighlightedDates([]);

    setStartDateInput("");
    setEndDateInput("");
  };

  const restartRange = (date: Date) => {
    setRange({ start: date, end: date });
  };

  const setRange = React.useCallback(
    ({ start, end }: DateRange) => {
      const selectedDates = eachDayOfInterval({ start, end }).map(date => {
        return {
          date,
          buttonProps: {
            style: {
              // TODO: make this configurable
              background: theme.calendar.selected,
              color: theme.customColors.white,
            },
          },
        };
      });

      const endMonth = addMonth(startMonth, 1);
      const startMonthDate = startOfMonth(startMonth);
      const endMonthDate = endOfMonth(endMonth);

      const dateVisible = isWithinInterval(end, {
        start: startMonthDate,
        end: endMonthDate,
      });

      /*
      TODO: handle case where not all dates are visible when doing this
      For example, click "last week" or "last school year" in presets may not show all days.

      Need to make sure they're all visible
    */

      // End date of range will show on the left side
      if (!dateVisible && isAfter(endMonthDate, end)) {
        setStartMonth(end);
      }

      // End date of range will show on the right side
      if (!dateVisible && isBefore(startMonthDate, end)) {
        setStartMonth(addMonth(end, -1));
      }

      setSelectedDates(selectedDates);

      setStartDateInput(start);
      setEndDateInput(end);

      onDateRangeSelected(start, end);
    },
    [
      onDateRangeSelected,
      startMonth,
      theme.calendar.selected,
      theme.customColors.white,
    ]
  );

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
    const start = selectedDates[0]?.date;
    const dateIsBefore = start !== undefined && isBefore(date, start);
    const hasRange = selectedDates.length > 1;

    // If the user hovers over a date before the selected start date
    // There's no need to highlight
    if (dateIsBefore || hasRange) {
      setHighlightedDates([]);
      return;
    }

    const newHighlightedDates = generateHighlightedDates(
      selectedDates[0]?.date,
      date
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

  React.useEffect(() => {
    if (startDate !== undefined && endDate !== undefined) {
      setRange({ start: startDate, end: endDate });
    }
  }, [startDate, endDate, setRange]);

  return (
    <div className={classes.container}>
      <div className={classes.dateRangeSelectContainer}>
        <Select
          value={selectedPreset}
          options={presetRanges}
          label={t("Date Range")}
          multiple={false}
          onChange={handlePresetChange}
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
      <div className={classes.calendarsContaienr}>
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
          />
        </div>
      </div>
      <div className={classes.actions}>
        <div className={classes.cancelButton}>
          <Button variant="outlined">Cancel</Button>
        </div>
        <div>
          <Button variant="contained">Apply</Button>
        </div>
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    background: theme.customColors.white,
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

  calendarsContaienr: {
    border: `1px solid ${theme.customColors.edluminSubText}`,
    borderRadius: theme.typography.pxToRem(4),
    display: "flex",
    marginBottom: theme.spacing(2),
    padding: theme.spacing(3),
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
  actions: {
    alignItems: "flex-end",
    display: "flex",
  },
  cancelButton: {
    flex: "1 0 auto",
  },
}));

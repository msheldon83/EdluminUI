import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import addMonth from "date-fns/addMonths";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import { DateInput } from "./date-input";
import { CustomCalendar as Calendar, CustomDate } from "./custom-calendar";
import { SelectNew as Select, OptionType } from "./select-new";
import {
  usePresetDateRanges,
  PresetRange,
  DateRange,
} from "./hooks/use-preset-date-ranges";

export const DateRangePicker = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const presetRanges = usePresetDateRanges();

  const [startMonth, setStartMonth] = React.useState(new Date());
  const [customDates, setCustomDates] = React.useState<CustomDate[]>([]);
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

  const resetRange = () => {
    setCustomDates([]);

    setStartDateInput("");
    setEndDateInput("");
  };

  const setRange = ({ start, end }: DateRange) => {
    const newCustomDates = eachDayOfInterval({ start, end }).map(date => {
      return {
        date,
        buttonProps: {
          style: {
            background: "red",
          },
        },
      };
    });

    /*
      TODO:

      Right now, this assumes that we want the end of date the range to be in
      the month on the right side. That's not necessarily the case if the range
      is only a month long. It should probably set it according to which side it's closest
      to. For example, if the range is set the a month previous to what's visible, set it
      on the left, etc.
    */
    setStartMonth(addMonth(end, -1));

    setCustomDates(newCustomDates);

    setStartDateInput(start);
    setEndDateInput(end);
  };

  const handleStartDateInputChange = (start: Date) => {
    const end = customDates[customDates.length - 1]?.date ?? start;

    setRange({ start, end });
    resetSelectedPreset();
  };

  const handleEndDateInputChange = (end: Date) => {
    const start = customDates[0]?.date ?? end;

    setRange({ start, end });
    resetSelectedPreset();
  };

  const handlePresetChange = (selection: OptionType) => {
    // Reset
    if (!selection || selection.label === "-") {
      resetRange();
      return;
    }

    const presetRange = selection as PresetRange;

    const { start, end } = presetRange.range();

    setSelectedPreset(presetRange);
    setRange({ start, end });
  };

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
            customDates={customDates}
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
            customDates={customDates}
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
    marginRight: theme.spacing(2),
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

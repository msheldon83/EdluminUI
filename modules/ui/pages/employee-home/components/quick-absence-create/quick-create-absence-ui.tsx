import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  makeStyles,
  Checkbox,
  IconButton,
  Typography,
} from "@material-ui/core";
import { Select } from "ui/components/form/select";
import {
  DayPartField,
  DayPartValue,
} from "ui/components/absence/day-part-field";
import { FieldError } from "react-hook-form/dist/types";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { FiveWeekCalendar } from "ui/components/form/five-week-calendar";
import { startOfDay, min } from "date-fns";
import { DayPart } from "graphql/server-types.gen";
import { useMemo } from "react";

type Props = {
  organizationId: string;
  employeeId: string;
  selectedAbsenceReason: string;
  absenceReasonOptions: { value: string; label: string }[];
  onAbsenceReasonChange: (event: any) => Promise<void>;
  absenceReasonError?: FieldError;
  currentMonth: Date;
  viewPreviousMonth: () => void;
  viewNextMonth: () => void;
  absenceDates: Date[];
  disabledDates: Date[];
  onToggleAbsenceDate: (date: Date) => void;
  selectedDayPart: DayPart | undefined;
  onDayPartChange: (value: DayPart | undefined) => void;
  hourlyStartTime?: Date;
  hourlyEndTime?: Date;
  onHourlyStartTimeChange: (value: Date | undefined) => void;
  onHourlyEndTimeChange: (value: Date | undefined) => void;
  startTimeError?: FieldError;
  endTimeError?: FieldError;
};

export const QuickAbsenceCreateUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    selectedAbsenceReason: absenceReason,
    absenceReasonOptions,
    onAbsenceReasonChange,
    absenceReasonError,
    viewPreviousMonth,
    viewNextMonth,
    absenceDates,
    disabledDates,
    onToggleAbsenceDate,
    currentMonth,
    selectedDayPart,
    onDayPartChange,
    hourlyStartTime,
    hourlyEndTime,
    onHourlyStartTimeChange,
    onHourlyEndTimeChange,
    startTimeError,
    endTimeError,
  } = props;

  const startDate = startOfDay(min(absenceDates));
  const selectedDayPartValue: DayPartValue = useMemo(() => {
    const part = { part: selectedDayPart };
    if (selectedDayPart === DayPart.Hourly) {
      return {
        ...part,
        start: hourlyStartTime,
        end: hourlyEndTime,
      };
    }
    return part;
  }, [selectedDayPart, hourlyEndTime, hourlyStartTime]);

  const onDayPartValueChange = React.useCallback(
    (value: DayPartValue) => {
      if (value.part) {
        if (value.part === DayPart.Hourly) {
          onHourlyStartTimeChange(value.start);
          onHourlyEndTimeChange(value.end);
        }
        onDayPartChange(value.part);
      }
    },
    [onDayPartChange, onHourlyEndTimeChange, onHourlyStartTimeChange]
  );
  return (
    <>
      <div className={classes.select}>
        <Typography>{t("Select a reason")}</Typography>
        <Select
          value={{
            value: absenceReason,
            label:
              absenceReasonOptions.find(a => a.value === absenceReason)
                ?.label || "",
          }}
          onChange={onAbsenceReasonChange}
          options={absenceReasonOptions}
          isClearable={false}
          inputStatus={absenceReasonError ? "error" : undefined}
          validationMessage={absenceReasonError?.message}
        />
      </div>

      <div className={classes.monthSwitcher}>
        <IconButton onClick={viewPreviousMonth}>
          <ChevronLeftIcon />
        </IconButton>
        <IconButton onClick={viewNextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </div>

      <FiveWeekCalendar
        startDate={currentMonth}
        disabledDates={disabledDates}
        selectedDates={absenceDates}
        onDateClicked={onToggleAbsenceDate}
      />

      <DayPartField
        employeeId={props.employeeId}
        organizationId={props.organizationId}
        value={selectedDayPartValue}
        onDayPartChange={onDayPartValueChange}
        startDate={startDate}
        startTimeError={startTimeError}
        endTimeError={endTimeError}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  select: {
    paddingTop: theme.typography.pxToRem(4),
    paddingBottom: theme.spacing(1),
  },
  monthSwitcher: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
}));

import { Button, Checkbox, makeStyles, Typography } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { min, startOfDay } from "date-fns";
import { formatISO } from "date-fns/esm";
import { DayPart, NeedsReplacement } from "graphql/server-types.gen";
import * as React from "react";
import { useMemo } from "react";
import { FieldError } from "react-hook-form/dist/types";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import {
  DayPartField,
  DayPartValue,
} from "ui/components/absence/day-part-field";
import { CustomCalendar } from "ui/components/form/custom-calendar";
import { SelectNew } from "ui/components/form/select-new";
import { TextButton } from "ui/components/text-button";
import { EmployeeCreateAbsenceRoute } from "ui/routes/create-absence";

type Props = {
  organizationId: string;
  employeeId: string;
  selectedAbsenceReason: string;
  absenceReasonOptions: { value: string; label: string }[];
  onAbsenceReasonChange: (event: any) => Promise<void>;
  absenceReasonError?: FieldError;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  selectedAbsenceDates: Date[];
  disabledDates: Date[];
  existingAbsenceDates: Date[];
  onToggleAbsenceDate: (date: Date) => void;
  selectedDayPart: DayPart | undefined;
  onDayPartChange: (value: DayPart | undefined) => void;
  hourlyStartTime?: Date;
  hourlyEndTime?: Date;
  onHourlyStartTimeChange: (value: Date | undefined) => void;
  onHourlyEndTimeChange: (value: Date | undefined) => void;
  startTimeError?: FieldError;
  endTimeError?: FieldError;
  isAdmin: boolean;
  wantsReplacement: boolean;
  needsReplacement?: NeedsReplacement | null;
  onNeedsReplacementChange: (needsReplacement: boolean) => void;
  isSubmitting: boolean;
};

export const QuickAbsenceCreateUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    selectedAbsenceReason: absenceReason,
    absenceReasonOptions,
    onAbsenceReasonChange,
    absenceReasonError,
    selectedAbsenceDates,
    disabledDates,
    existingAbsenceDates,
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
    isAdmin,
    needsReplacement,
    wantsReplacement,
    onNeedsReplacementChange,
    onMonthChange,
  } = props;

  const startDate = startOfDay(min(selectedAbsenceDates));
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

  const onNeedsReplacementChangeCallback = React.useCallback(
    (event: any) => {
      onNeedsReplacementChange(event.target.checked);
    },
    [onNeedsReplacementChange]
  );

  const history = useHistory();
  const addAdditionalDetails = React.useCallback(() => {
    const params = new URLSearchParams();
    params.set("absenceReason", absenceReason);
    params.set(
      "dates",
      selectedAbsenceDates
        .map(d => formatISO(d, { representation: "date" }))
        .join(",")
    );
    params.set("dayPart", selectedDayPart || "");
    params.set("needsReplacement", wantsReplacement.toString());
    if (hourlyStartTime) {
      params.set("start", hourlyStartTime.toISOString());
    }
    if (hourlyEndTime) {
      params.set("end", hourlyEndTime.toISOString());
    }
    history.push(
      `${EmployeeCreateAbsenceRoute.generate({})}?${params.toString()}`
    );
  }, [
    history,
    absenceReason,
    selectedAbsenceDates,
    selectedDayPart,
    wantsReplacement,
    hourlyStartTime,
    hourlyEndTime,
  ]);

  const customDatesDisabled = useMemo(
    () =>
      disabledDates.map(date => {
        return {
          date,
          buttonProps: { className: classes.dateDisabled },
        };
      }),
    [disabledDates]
  );

  const customExistingAbsenceDates = useMemo(
    () =>
      existingAbsenceDates.map(date => {
        return {
          date,
          buttonProps: { className: classes.existingDate },
        };
      }),
    [existingAbsenceDates]
  );

  const customSelectedAbsenceDates = useMemo(
    () =>
      selectedAbsenceDates.map(date => {
        return {
          date,
          buttonProps: { className: classes.selectedAbsenceDate },
        };
      }),
    [selectedAbsenceDates]
  );

  const customDates = useMemo(
    () => [
      ...customDatesDisabled,
      ...customExistingAbsenceDates,
      ...customSelectedAbsenceDates,
    ],
    [
      customDatesDisabled,
      customExistingAbsenceDates,
      customSelectedAbsenceDates,
    ]
  );

  return (
    <>
      <div className={classes.select}>
        <Typography>{t("Select a reason")}</Typography>
        <SelectNew
          value={{
            value: absenceReason ?? "",
            label:
              absenceReasonOptions.find(a => a.value === absenceReason)
                ?.label || "",
          }}
          onChange={onAbsenceReasonChange}
          options={absenceReasonOptions}
          multiple={false}
          inputStatus={absenceReasonError ? "error" : undefined}
          validationMessage={absenceReasonError?.message}
        />
      </div>

      <CustomCalendar
        month={currentMonth}
        monthNavigation
        onMonthChange={onMonthChange}
        customDates={customDates}
        onSelectDates={dates => dates.forEach(onToggleAbsenceDate)}
        variant="month"
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

      <div className={classes.replacementNeeded}>
        {isAdmin || needsReplacement === NeedsReplacement.Sometimes ? (
          <FormControlLabel
            label={t("Requires a substitute")}
            control={
              <Checkbox
                checked={wantsReplacement}
                onChange={onNeedsReplacementChangeCallback}
                color="primary"
              />
            }
          />
        ) : (
          <Typography className={classes.substituteRequiredText}>
            {needsReplacement === NeedsReplacement.Yes
              ? t("Requires a substitute")
              : t("No substitute required")}
          </Typography>
        )}
      </div>

      <div className={classes.buttons}>
        <TextButton
          disabled={props.isSubmitting}
          className={classes.additionalButton}
          onClick={addAdditionalDetails}
        >
          {t("Add additional details")}
        </TextButton>
        <Button disabled={props.isSubmitting} variant="outlined" type="submit">
          {t("Quick Create")}
        </Button>
      </div>
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
  substituteRequiredText: {
    fontStyle: "italic",
  },
  replacementNeeded: {
    padding: theme.spacing(1),
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
  },
  additionalButton: {
    marginRight: theme.spacing(3),
  },
  dateDisabled: {
    backgroundColor: theme.customColors.lightGray,
    color: theme.palette.text.disabled,

    "&:hover": {
      backgroundColor: theme.customColors.lightGray,
      color: theme.palette.text.disabled,
    },
  },

  existingDate: {
    backgroundColor: theme.customColors.lightBlue,
    color: theme.palette.text.disabled,

    "&:hover": {
      backgroundColor: theme.customColors.lightBlue,
      color: theme.palette.text.disabled,
    },
  },
  selectedAbsenceDate: {
    backgroundColor: theme.palette.primary.main,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: theme.customColors.white,
    },
  },
}));

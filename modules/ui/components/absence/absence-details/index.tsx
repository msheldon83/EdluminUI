import {
  Button,
  Checkbox,
  Grid,
  makeStyles,
  Paper,
  Typography,
  IconButton,
} from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import InfoIcon from "@material-ui/icons/Info";
import { isValid, parseISO, format, max, startOfDay, min } from "date-fns";
import { Errors, SetValue, TriggerValidation } from "forms";
import {
  DayPart,
  FeatureFlag,
  NeedsReplacement,
  Vacancy,
  PositionScheduleDate,
} from "graphql/server-types.gen";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { useOrgFeatureFlags } from "reference-data/org-feature-flags";
import { AssignedSub } from "ui/components/absence/assigned-sub";
import {
  dayPartToLabel,
  ScheduleTimes,
  dayPartToTimesLabel,
} from "ui/components/absence/helpers";
import {
  DatePicker,
  DatePickerOnChange,
  DatePickerOnMonthChange,
} from "ui/components/form/date-picker";
import { Input } from "ui/components/form/input";
import { Select } from "ui/components/form/select";
import { TimeInput } from "ui/components/form/time-input";
import { SubstituteRequiredDetails } from "./substitute-required-details";
import { VacancyDetail } from "ui/components/absence/types";
import { GetEmployeeScheduleTimes } from "../graphql/get-employee-schedule-times.gen";
import { useQueryBundle } from "graphql/hooks";
import { DisabledDate } from "helpers/absence/computeDisabledDates";
import { FiveWeekCalendar } from "ui/components/form/five-week-calendar";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { addMonths } from "date-fns/esm";
import { useHistory } from "react-router";

export type AbsenceDetailsFormData = {
  dayPart?: DayPart;
  absenceReason: string;
  replacementEmployeeId?: number;
  replacementEmployeeName?: string;
  accountingCode?: string;
  payCode?: string;
  hourlyStartTime?: Date;
  hourlyEndTime?: Date;
};

type Props = {
  absenceDates: Date[];
  onToggleAbsenceDate: (d: Date) => void;
  saveLabel?: string;
  organizationId: string;
  employeeId: string;
  onSubstituteWantedChange: (wanted: boolean) => void;
  currentMonth: Date;
  onSwitchMonth: (month: Date) => void;
  setValue: SetValue;
  values: AbsenceDetailsFormData;
  errors: Errors;
  triggerValidation: TriggerValidation;
  isAdmin: null | boolean;
  needsReplacement: NeedsReplacement;
  wantsReplacement: boolean;
  vacancies: Vacancy[];
  locationIds?: number[];
  setStep: (S: "absence" | "preAssignSub" | "edit") => void;
  disabledDates: DisabledDate[];
  balanceUsageText?: string;
  setVacanciesInput: (input: VacancyDetail[] | undefined) => void;
  /** default: pre-arrange */
  arrangeSubButtonTitle?: string;
  /** default: pre-arranged */
  arrangedSubText?: string;
  disableReplacementInteractions?: boolean;
  disableEditingDatesAndTimes?: boolean;
  replacementEmployeeId?: number;
  replacementEmployeeName?: string;
  onRemoveReplacement: (
    replacementEmployeeId: number,
    replacementEmployeeName?: string,
    assignmentRowVersion?: string
  ) => void;
  returnUrl?: string;
};

export const AbsenceDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const textFieldClasses = useTextFieldClasses();
  const { t } = useTranslation();
  const history = useHistory();
  const {
    organizationId,
    setValue,
    values,
    isAdmin,
    needsReplacement,
    wantsReplacement,
    onSubstituteWantedChange,
    onSwitchMonth,
    errors,
    triggerValidation,
  } = props;

  const [hourlyStartTime, setHourlyStartTime] = useState<string | undefined>(
    values.hourlyStartTime ? values.hourlyStartTime.toISOString() : undefined
  );
  const [hourlyEndTime, setHourlyEndTime] = useState<string | undefined>(
    values.hourlyEndTime ? values.hourlyEndTime.toISOString() : undefined
  );

  useEffect(() => {
    const parsedStartTimeDate = parseISO(hourlyStartTime ?? "");
    const startTimeDate = isValid(parsedStartTimeDate)
      ? parsedStartTimeDate
      : undefined;
    onHourlyStartTimeChange(startTimeDate);
  }, [hourlyStartTime]);

  const onHourlyStartTimeChange = React.useCallback(
    async (startTime?: Date | undefined) => {
      await setValue("hourlyStartTime", startTime);
      await triggerValidation({ name: "hourlyStartTime" });
    },
    [setValue]
  );

  useEffect(() => {
    const parsedEndTimeDate = parseISO(hourlyEndTime ?? "");
    const endTimeDate = isValid(parsedEndTimeDate)
      ? parsedEndTimeDate
      : undefined;
    onHourlyEndTimeChange(endTimeDate);
  }, [hourlyEndTime]);

  const onHourlyEndTimeChange = React.useCallback(
    async (endTime?: Date | undefined) => {
      await setValue("hourlyEndTime", endTime);
      await triggerValidation({ name: "hourlyEndTime" });
    },
    [setValue, triggerValidation]
  );

  const absenceReasons = useAbsenceReasons(organizationId);
  const absenceReasonOptions = useMemo(
    () => absenceReasons.map(r => ({ label: r.name, value: r.id })),
    [absenceReasons]
  );
  const featureFlags = useOrgFeatureFlags(organizationId);
  const dayPartOptions = useMemo(
    () => featureFlagsToDayPartOptions(featureFlags),
    [featureFlags]
  );

  const startDate = startOfDay(min(props.absenceDates));
  const endDate = startOfDay(max(props.absenceDates));
  const getEmployeeScheduleTimes = useQueryBundle(GetEmployeeScheduleTimes, {
    variables: {
      id: props.employeeId,
      fromDate: isValid(startDate) ? format(startDate, "P") : undefined,
      toDate: isValid(startDate) ? format(startDate, "P") : undefined,
    },
    skip: !isValid(startDate),
  });
  const employeeScheduleTimes: ScheduleTimes | undefined = useMemo(() => {
    if (
      getEmployeeScheduleTimes.state === "DONE" ||
      getEmployeeScheduleTimes.state === "UPDATING"
    ) {
      const scheduleTimes =
        getEmployeeScheduleTimes.data?.employee?.employeePositionSchedule &&
        getEmployeeScheduleTimes.data?.employee?.employeePositionSchedule
          .length > 0
          ? (getEmployeeScheduleTimes.data?.employee
              ?.employeePositionSchedule[0] as Pick<
              PositionScheduleDate,
              | "startTimeLocal"
              | "endTimeLocal"
              | "halfDayMorningEndLocal"
              | "halfDayAfternoonStartLocal"
            >)
          : undefined;

      if (!scheduleTimes) {
        return undefined;
      }

      return {
        startTime: format(parseISO(scheduleTimes.startTimeLocal), "h:mm a"),
        halfDayMorningEnd: format(
          parseISO(scheduleTimes.halfDayMorningEndLocal),
          "h:mm a"
        ),
        halfDayAfternoonStart: format(
          parseISO(scheduleTimes.halfDayAfternoonStartLocal),
          "h:mm a"
        ),
        endTime: format(parseISO(scheduleTimes.endTimeLocal), "h:mm a"),
      };
    }
  }, [getEmployeeScheduleTimes]);

  useEffect(() => {
    if (!values.dayPart && dayPartOptions && dayPartOptions[0]) {
      // Default the Day Part selection to the first one
      setValue("dayPart", dayPartOptions[0]);
    }
  }, [dayPartOptions]);

  const onReasonChange = React.useCallback(
    async event => {
      await setValue("absenceReason", event.value);
      await triggerValidation({ name: "absenceReason" });
    },
    [setValue, triggerValidation]
  );

  const onDayPartChange = React.useCallback(
    async event => {
      if (props.disableEditingDatesAndTimes) return;
      /* Clear vacancy input */ props.setVacanciesInput(undefined);
      await setValue("dayPart", event.target.value);
    },
    [setValue, props.setVacanciesInput]
  );

  const onNotesToApproverChange = React.useCallback(
    async event => {
      await setValue("notesToApprover", event.target.value);
    },
    [setValue]
  );

  const onNeedsReplacementChange = React.useCallback(
    event => {
      onSubstituteWantedChange(event.target.checked);
    },
    [onSubstituteWantedChange]
  );

  const viewPreviousMonth = React.useCallback(() => {
    const previousMonth = addMonths(props.currentMonth, -1);
    onSwitchMonth(previousMonth);
  }, [props.currentMonth, onSwitchMonth]);

  const viewNextMonth = React.useCallback(() => {
    const nextMonth = addMonths(props.currentMonth, 1);
    onSwitchMonth(nextMonth);
  }, [props.currentMonth, onSwitchMonth]);

  return (
    <Grid container>
      <Grid item md={4} className={classes.spacing}>
        <Typography variant="h5">{t("Absence Details")}</Typography>

        <div className={classes.select}>
          <Typography>{t("Select a reason")}</Typography>
          <Select
            value={{
              value: values.absenceReason,
              label:
                absenceReasonOptions.find(a => a.value === values.absenceReason)
                  ?.label || "",
            }}
            onChange={onReasonChange}
            options={absenceReasonOptions}
            isClearable={false}
            inputStatus={errors.absenceReason ? "error" : undefined}
            validationMessage={errors.absenceReason?.message}
            // label={t("Reason")}
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
          startDate={props.currentMonth}
          disabledDates={props.disabledDates.map(d => d.date)}
          selectedDates={props.absenceDates}
          onDateClicked={props.onToggleAbsenceDate}
        />

        {props.balanceUsageText && (
          <div className={classes.usageTextContainer}>
            <InfoIcon color="primary" />
            <Typography className={classes.usageText}>
              {props.balanceUsageText}
            </Typography>
          </div>
        )}

        <RadioGroup
          onChange={onDayPartChange}
          aria-label="dayPart"
          className={classes.radioGroup}
        >
          {dayPartOptions.map((type, i) => {
            const timeDisplay = employeeScheduleTimes
              ? dayPartToTimesLabel(type, employeeScheduleTimes)
              : "";
            return (
              <Grid
                container
                justify="space-between"
                alignItems="center"
                key={type}
              >
                <Grid item xs={10}>
                  <FormControlLabel
                    value={type}
                    control={<Radio checked={type === values.dayPart} />}
                    disabled={props.disableEditingDatesAndTimes}
                    label={`${t(dayPartToLabel(type))} ${timeDisplay}`}
                  />
                </Grid>
                <Grid item xs={2}>
                  {dayPartToIcon(type, classes)}
                </Grid>
              </Grid>
            );
          })}
        </RadioGroup>
        {values.dayPart === DayPart.Hourly && (
          <div className={classes.hourlyTimes}>
            <div className={classes.time}>
              <TimeInput
                label=""
                value={hourlyStartTime}
                onValidTime={time => setHourlyStartTime(time)}
                onChange={value => setHourlyStartTime(value)}
                inputStatus={errors.hourlyStartTime ? "error" : undefined}
                validationMessage={errors.hourlyStartTime?.message}
              />
            </div>
            <div className={classes.time}>
              <TimeInput
                label=""
                value={hourlyEndTime}
                onValidTime={time => setHourlyEndTime(time)}
                onChange={value => setHourlyEndTime(value)}
                earliestTime={hourlyStartTime}
                inputStatus={errors.hourlyEndTime ? "error" : undefined}
                validationMessage={errors.hourlyEndTime?.message}
              />
            </div>
          </div>
        )}

        <div className={classes.notesForApprover}>
          <Typography variant="h6">{t("Notes for administration")}</Typography>
          <Typography className={classes.subText}>
            {t("Can be seen by the administrator and the employee.")}
          </Typography>
          <Input
            multiline
            rows="6"
            onChange={onNotesToApproverChange}
            classes={textFieldClasses}
          />
        </div>
      </Grid>

      <Grid item md={6}>
        <Typography className={classes.substituteDetailsTitle} variant="h5">
          {t("Substitute Details")}
        </Typography>
        <Typography className={classes.subText}>
          {t(
            "These times may not match your schedule exactly depending on district configuration."
          )}
        </Typography>

        <Paper>
          {props.replacementEmployeeId && (
            <AssignedSub
              disableReplacementInteractions={
                props.disableReplacementInteractions
              }
              employeeId={props.replacementEmployeeId}
              employeeName={props.replacementEmployeeName || ""}
              subText={props.arrangedSubText ?? t("pre-arranged")}
              onRemove={props.onRemoveReplacement}
            />
          )}
          <div className={classes.container}>
            {isAdmin || needsReplacement === NeedsReplacement.Sometimes ? (
              <FormControlLabel
                label={t("Requires a substitute")}
                control={
                  <Checkbox
                    checked={wantsReplacement}
                    onChange={onNeedsReplacementChange}
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

            {wantsReplacement && (
              <SubstituteRequiredDetails
                disableReplacementInteractions={
                  props.disableReplacementInteractions
                }
                disableEditingDatesAndTimes={props.disableEditingDatesAndTimes}
                setValue={setValue}
                vacancies={props.vacancies}
                setStep={props.setStep}
                organizationId={organizationId}
                triggerValidation={triggerValidation}
                values={values}
                errors={errors}
                isAdmin={!!isAdmin}
                arrangeSubButtonTitle={props.arrangeSubButtonTitle}
                disabledDates={props.disabledDates}
                replacementEmployeeId={props.replacementEmployeeId}
                replacementEmployeeName={props.replacementEmployeeName}
                locationIds={props.locationIds}
              />
            )}
          </div>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <div className={classes.actionButtons}>
          {props.returnUrl && (
            <Button
              onClick={() => history.push(props.returnUrl!)}
              variant="outlined"
              className={classes.cancelButton}
            >
              {t("Cancel")}
            </Button>
          )}
          <Button type="submit" variant="contained">
            {props.saveLabel ?? t("Create")}
          </Button>
        </div>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  actionButtons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    marginRight: theme.spacing(2),
  },
  select: {
    paddingTop: theme.typography.pxToRem(4),
    paddingBottom: theme.spacing(1),
  },
  radioGroup: {
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  spacing: {
    paddingRight: theme.spacing(4),
  },
  subText: {
    color: theme.customColors.darkGray,
  },
  substituteDetailsTitle: { paddingBottom: theme.typography.pxToRem(3) },
  substituteDetailsSubtitle: { paddingBottom: theme.typography.pxToRem(1) },
  container: {
    padding: theme.spacing(2),
  },
  substituteRequiredText: {
    fontStyle: "italic",
  },
  hourlyTimes: {
    paddingLeft: theme.spacing(4),
    display: "flex",
  },
  time: {
    width: "40%",
    paddingLeft: theme.spacing(),
  },
  notesForApprover: {
    paddingTop: theme.spacing(3),
  },
  usageTextContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    margin: `${theme.spacing(2)}px 0`,
  },
  usageText: {
    marginLeft: theme.spacing(1),
  },
  dayPartIcon: {
    height: theme.spacing(3),
  },
  monthSwitcher: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
}));

const useTextFieldClasses = makeStyles(theme => ({
  multiline: {
    padding: theme.spacing(1),
  },
}));

const featureFlagsToDayPartOptions = (
  featureFlags: FeatureFlag[]
): DayPart[] => {
  const dayPartOptions: DayPart[] = [];
  // Day Part options have to be in a specific order
  if (featureFlags.includes(FeatureFlag.FullDayAbsences)) {
    dayPartOptions.push(DayPart.FullDay);
  }

  if (featureFlags.includes(FeatureFlag.HalfDayAbsences)) {
    dayPartOptions.push(DayPart.HalfDayMorning);
    dayPartOptions.push(DayPart.HalfDayAfternoon);
  }

  if (featureFlags.includes(FeatureFlag.QuarterDayAbsences)) {
    dayPartOptions.push(DayPart.QuarterDayEarlyMorning);
    dayPartOptions.push(DayPart.QuarterDayLateMorning);
    dayPartOptions.push(DayPart.QuarterDayEarlyAfternoon);
    dayPartOptions.push(DayPart.QuarterDayLateAfternoon);
  }

  // Add Hourly last
  if (featureFlags.includes(FeatureFlag.HourlyAbsences)) {
    dayPartOptions.push(DayPart.Hourly);
  }

  return dayPartOptions;
};

const dayPartToIcon = (dayPart: DayPart, classes: any): React.ReactFragment => {
  switch (dayPart) {
    case DayPart.FullDay:
      return (
        <img
          src={require("ui/icons/full-day.svg")}
          className={classes.dayPartIcon}
        />
      );
    case DayPart.HalfDayMorning:
      return (
        <img
          src={require("ui/icons/half-day-am.svg")}
          className={classes.dayPartIcon}
        />
      );
    case DayPart.HalfDayAfternoon:
      return (
        <img
          src={require("ui/icons/half-day-pm.svg")}
          className={classes.dayPartIcon}
        />
      );
    case DayPart.Hourly:
      return (
        <img
          src={require("ui/icons/partial-day.svg")}
          className={classes.dayPartIcon}
        />
      );
    case DayPart.QuarterDayEarlyMorning:
    case DayPart.QuarterDayLateMorning:
    case DayPart.QuarterDayEarlyAfternoon:
    case DayPart.QuarterDayLateAfternoon:
    default:
      return "";
  }
};

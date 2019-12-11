import {
  Button,
  Checkbox,
  Grid,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import InfoIcon from "@material-ui/icons/Info";
import { isValid, parseISO } from "date-fns";
import { Errors, SetValue, TriggerValidation } from "forms";
import {
  DayPart,
  FeatureFlag,
  NeedsReplacement,
  Vacancy,
} from "graphql/server-types.gen";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { useOrgFeatureFlags } from "reference-data/org-feature-flags";
import { AssignedSub } from "ui/components/absence/assigned-sub";
import { dayPartToLabel } from "ui/components/absence/helpers";
import {
  DatePicker,
  DatePickerOnChange,
  DatePickerOnMonthChange,
} from "ui/components/form/date-picker";
import { Input } from "ui/components/form/input";
import { Select } from "ui/components/form/select";
import { TimeInput } from "ui/components/form/time-input";
import { SubstituteRequiredDetails } from "./substitute-required-details";
import { VacancyDetail } from "ui/pages/create-absence/types";

export type AbsenceDetailsFormData = {
  dayPart?: DayPart;
  absenceReason: string;
  startDate: Date;
  endDate: Date;
  replacementEmployeeId?: number;
  replacementEmployeeName?: string;
  accountingCode?: string;
  payCode?: string;
};

type Props = {
  saveLabel?: string;
  organizationId: string;
  onSubstituteWantedChange: (wanted: boolean) => void;
  onSwitchMonth: (month: Date) => void;
  setValue: SetValue;
  values: AbsenceDetailsFormData;
  errors: Errors;
  triggerValidation: TriggerValidation;
  isAdmin: null | boolean;
  needsReplacement: NeedsReplacement;
  wantsReplacement: boolean;
  vacancies: Vacancy[];
  setStep: (S: "absence" | "preAssignSub" | "edit") => void;
  disabledDates: Date[];
  balanceUsageText?: string;
  setVacanciesInput: React.Dispatch<
    React.SetStateAction<VacancyDetail[] | undefined>
  >;
  /** default: pre-arrange */
  arrangeSubButtonTitle?: string;
  /** default: pre-arranged */
  arrangedSubText?: string;
};

export const AbsenceDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const textFieldClasses = useTextFieldClasses();
  const { t } = useTranslation();
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

  const [hourlyStartTime, setHourlyStartTime] = useState<string | undefined>();
  const [hourlyEndTime, setHourlyEndTime] = useState<string | undefined>();

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

  useEffect(() => {
    if (!values.dayPart && dayPartOptions && dayPartOptions[0]) {
      // Default the Day Part selection to the first one
      setValue("dayPart", dayPartOptions[0]);
    }
  }, [dayPartOptions]);

  const onDateChange: DatePickerOnChange = React.useCallback(
    async ({ startDate, endDate }) => {
      await setValue("startDate", startDate);
      await setValue("endDate", endDate);
      /* Clear vacancy input */ props.setVacanciesInput(undefined);
    },
    [setValue, props.setVacanciesInput]
  );
  const onReasonChange = React.useCallback(
    async event => {
      await setValue("absenceReason", event.value);
      await triggerValidation({ name: "absenceReason" });
    },
    [setValue, triggerValidation]
  );

  const onDayPartChange = React.useCallback(
    async event => {
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

  const onMonthChange: DatePickerOnMonthChange = React.useCallback(
    date => {
      onSwitchMonth(date);
    },
    [onSwitchMonth]
  );

  const removePrearrangedReplacementEmployee = async () => {
    await setValue("replacementEmployeeId", undefined);
    await setValue("replacementEmployeeName", undefined);
  };

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

        <DatePicker
          startDate={values.startDate}
          endDate={values.endDate}
          onChange={onDateChange}
          startLabel={t("From")}
          endLabel={t("To")}
          onMonthChange={onMonthChange}
          disableDates={props.disabledDates}
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
          {dayPartOptions.map((type, i) => (
            <FormControlLabel
              key={type}
              value={type}
              control={<Radio checked={type === values.dayPart} />}
              label={t(dayPartToLabel(type))}
            />
          ))}
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
          {values.replacementEmployeeId && (
            <AssignedSub
              employeeId={values.replacementEmployeeId}
              employeeName={values.replacementEmployeeName || ""}
              subText={props.arrangedSubText ?? t("pre-arranged")}
              onRemove={removePrearrangedReplacementEmployee}
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
                setValue={setValue}
                vacancies={props.vacancies}
                setStep={props.setStep}
                organizationId={organizationId}
                triggerValidation={triggerValidation}
                values={values}
                errors={errors}
                isAdmin={!!isAdmin}
                arrangeSubButtonTitle={props.arrangeSubButtonTitle}
              />
            )}
          </div>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <div className={classes.actionButtons}>
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
  featureFlags.map(a => {
    switch (a) {
      case FeatureFlag.FullDayAbsences:
        dayPartOptions.push(DayPart.FullDay);
        break;
      case FeatureFlag.HalfDayAbsences:
        dayPartOptions.push(DayPart.HalfDayAfternoon);
        dayPartOptions.push(DayPart.HalfDayMorning);
        break;
      case FeatureFlag.QuarterDayAbsences:
        dayPartOptions.push(DayPart.QuarterDayEarlyAfternoon);
        dayPartOptions.push(DayPart.QuarterDayLateAfternoon);
        dayPartOptions.push(DayPart.QuarterDayEarlyMorning);
        dayPartOptions.push(DayPart.QuarterDayLateMorning);
        break;
      case FeatureFlag.HourlyAbsences:
        dayPartOptions.push(DayPart.Hourly);
        break;
      case FeatureFlag.None:
      default:
        break;
    }
  });
  return dayPartOptions;
};

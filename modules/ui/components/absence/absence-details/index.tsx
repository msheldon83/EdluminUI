import {
  Button,
  Checkbox,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import InfoIcon from "@material-ui/icons/Info";
import { min, startOfDay } from "date-fns";
import { addMonths } from "date-fns/esm";
import { Errors, SetValue, TriggerValidation } from "forms";
import { DayPart, NeedsReplacement, Vacancy } from "graphql/server-types.gen";
import { DisabledDate } from "helpers/absence/computeDisabledDates";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { AssignedSub } from "ui/components/absence/assigned-sub";
import { VacancyDetail } from "ui/components/absence/types";
import { CustomCalendar } from "ui/components/form/custom-calendar";
import { Input } from "ui/components/form/input";
import { Select } from "ui/components/form/select";
import { DayPartField, DayPartValue } from "../day-part-field";
import { SubstituteRequiredDetails } from "./substitute-required-details";

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

  const absenceReasons = useAbsenceReasons(organizationId);
  const absenceReasonOptions = useMemo(
    () => absenceReasons.map(r => ({ label: r.name, value: r.id })),
    [absenceReasons]
  );

  const startDate = startOfDay(min(props.absenceDates));

  const onReasonChange = React.useCallback(
    async event => {
      await setValue("absenceReason", event.value);
      await triggerValidation({ name: "absenceReason" });
    },
    [setValue, triggerValidation]
  );

  const onDayPartChange = React.useCallback(
    async (value: DayPartValue) => {
      if (props.disableEditingDatesAndTimes) return;
      /* Clear vacancy input */
      props.setVacanciesInput(undefined);
      await setValue("dayPart", value.part);
      if (value.part === DayPart.Hourly) {
        await setValue("hourlyStartTime", value.start);
        if (value.start) await triggerValidation({ name: "hourlyStartTime" });
        await setValue("hourlyEndTime", value.end);
        if (value.end) await triggerValidation({ name: "hourlyEndTime" });
      } else {
        await setValue("hourlyStartTime", undefined);
        await setValue("hourlyEndTime", undefined);
      }
    },
    [props, setValue, triggerValidation]
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

  const dayPartValue: DayPartValue = React.useMemo(() => {
    if (values.dayPart === DayPart.Hourly) {
      return {
        part: values.dayPart,
        start: values.hourlyStartTime,
        end: values.hourlyEndTime,
      };
    }
    return { part: values.dayPart };
  }, [values.dayPart, values.hourlyStartTime, values.hourlyEndTime]);

  const customDatesDisabled = props.disabledDates.map(({ date }) => {
    return {
      date,
      buttonProps: { className: classes.dateDisabled },
    };
  });

  const customAbsenceDates = props.absenceDates.map(date => {
    return {
      date,
      buttonProps: { className: classes.absenceDate },
    };
  });

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

        <CustomCalendar
          month={props.currentMonth}
          monthNavigation
          variant="month"
          customDates={customDatesDisabled.concat(customAbsenceDates)}
          onMonthChange={props.onSwitchMonth}
          onSelectDates={dates => dates.forEach(props.onToggleAbsenceDate)}
        />

        {props.balanceUsageText && (
          <div className={classes.usageTextContainer}>
            <InfoIcon color="primary" />
            <Typography className={classes.usageText}>
              {props.balanceUsageText}
            </Typography>
          </div>
        )}

        <DayPartField
          employeeId={props.employeeId}
          organizationId={props.organizationId}
          startDate={startDate}
          value={dayPartValue}
          onDayPartChange={onDayPartChange}
          startTimeError={errors.hourlyStartTime}
          endTimeError={errors.hourlyEndTime}
          disabled={props.disableEditingDatesAndTimes}
        />

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
  dateDisabled: {
    backgroundColor: theme.customColors.lightGray,
    color: theme.palette.text.disabled,

    "&:hover": {
      backgroundColor: theme.customColors.lightGray,
      color: theme.palette.text.disabled,
    },
  },
  absenceDate: {
    backgroundColor: theme.palette.primary.main,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: theme.customColors.white,
    },
  },
}));

const useTextFieldClasses = makeStyles(theme => ({
  multiline: {
    padding: theme.spacing(1),
  },
}));

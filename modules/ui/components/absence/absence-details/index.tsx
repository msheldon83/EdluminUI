import { Button, Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { min, startOfDay, parseISO } from "date-fns";
import { Errors, SetValue, TriggerValidation } from "forms";
import {
  DayPart,
  NeedsReplacement,
  PermissionEnum,
  Vacancy,
} from "graphql/server-types.gen";
import { DisabledDate } from "helpers/absence/computeDisabledDates";
import * as React from "react";
import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { AssignedSub } from "ui/components/absence/assigned-sub";
import { VacancyDetail } from "ui/components/absence/types";
import { Can } from "ui/components/auth/can";
import { SelectNew } from "ui/components/form/select-new";
import { CreateAbsenceCalendar } from "../create-absence-calendar";
import { DayPartField, DayPartValue } from "../day-part-field";
import { NoteField } from "./notes-field";
import { SubstituteRequiredDetails } from "./substitute-required-details";
import { flatMap, uniq } from "lodash-es";
import { vacanciesHaveMultipleAssignments } from "../helpers";

export type AbsenceDetailsFormData = {
  dayPart?: DayPart;
  absenceReason: string;
  replacementEmployeeId?: string;
  replacementEmployeeName?: string;
  accountingCode?: string;
  payCode?: string;
  hourlyStartTime?: Date;
  hourlyEndTime?: Date;
  notesToApprover?: string;
  notesToReplacement?: string;
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
  vacancyDetails: VacancyDetail[];
  locationIds?: string[];
  setStep: (S: "absence" | "preAssignSub" | "edit") => void;
  disabledDates: Date[];
  balanceUsageText?: string;
  setVacanciesInput: (input: VacancyDetail[] | undefined) => void;
  /** default: pre-arrange */
  arrangeSubButtonTitle?: string;
  /** default: pre-arranged */
  arrangedSubText?: string;
  assignmentId?: string;
  disableReplacementInteractions?: boolean;
  disableEditingDatesAndTimes?: boolean;
  replacementEmployeeId?: string;
  replacementEmployeeName?: string;
  onRemoveReplacement: (
    assignmentId?: string,
    assignmentRowVersion?: string,
    vacancyDetailIds?: string[]
  ) => Promise<void>;
  returnUrl?: string;
  isSubmitted: boolean;
  initialAbsenceCreation: boolean;
  onDelete?: () => void;
  onCancel?: () => void;
  isFormDirty: boolean;
  setshowPrompt: (show: boolean) => void;
  onAssignSubClick: (
    vacancyDetailIds?: string[],
    employeeToReplace?: string
  ) => void;
  hasEditedDetails: boolean;
};

export const AbsenceDetails: React.FC<Props> = props => {
  const classes = useStyles();
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

  //this is used to enable prompt if unsaved.
  useEffect(() => {
    props.setshowPrompt(true);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const isSplitVacancy = useMemo(() => {
    return vacanciesHaveMultipleAssignments(props.vacancies);
  }, [props.vacancies]);

  const assignmentStartTime = useMemo(() => {
    const details = props.vacancies[0]?.details;
    const startTime =
      details && details[0] ? details[0].startTimeLocal : undefined;
    return startTime ? parseISO(startTime) : undefined;
  }, [props.vacancies]);

  return (
    <Grid container>
      <Grid item md={4} className={classes.spacing}>
        <Typography variant="h5">{t("Absence Details")}</Typography>

        <div className={classes.select}>
          <Typography>{t("Select a reason")}</Typography>
          <SelectNew
            value={{
              value: values.absenceReason ?? "",
              label:
                absenceReasonOptions.find(a => a.value === values.absenceReason)
                  ?.label || "",
            }}
            onChange={onReasonChange}
            multiple={false}
            options={absenceReasonOptions}
            inputStatus={errors.absenceReason ? "error" : undefined}
            validationMessage={errors.absenceReason?.message}
            withResetValue={false}
          />
        </div>

        <CreateAbsenceCalendar
          monthNavigation
          selectedAbsenceDates={props.absenceDates}
          employeeId={props.employeeId}
          currentMonth={props.currentMonth}
          onMonthChange={onSwitchMonth}
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

          <NoteField
            onChange={onNotesToApproverChange}
            name={"notesToApprover"}
            isSubmitted={props.isSubmitted}
            initialAbsenceCreation={props.initialAbsenceCreation}
            value={values.notesToApprover}
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

        {props.replacementEmployeeId && !isSplitVacancy && (
          <AssignedSub
            disableReplacementInteractions={
              props.disableReplacementInteractions
            }
            employeeId={props.replacementEmployeeId}
            assignmentId={props.assignmentId}
            employeeName={props.replacementEmployeeName || ""}
            subText={props.arrangedSubText ?? t("pre-arranged")}
            onCancelAssignment={props.onRemoveReplacement}
            assignmentStartDate={assignmentStartTime ?? startDate}
            vacancies={props.vacancies}
          />
        )}

        <div className={classes.subDetailsContainer}>
          <SubstituteRequiredDetails
            disableReplacementInteractions={
              props.disableReplacementInteractions
            }
            disableEditingDatesAndTimes={props.disableEditingDatesAndTimes}
            setValue={setValue}
            vacancies={props.vacancies}
            vacancyDetails={props.vacancyDetails}
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
            isSubmitted={props.isSubmitted}
            initialAbsenceCreation={props.initialAbsenceCreation}
            needsReplacement={needsReplacement}
            wantsReplacement={wantsReplacement}
            onSubstituteWantedChange={onSubstituteWantedChange}
            isFormDirty={props.isFormDirty}
            onCancelAssignment={props.onRemoveReplacement}
            isSplitVacancy={isSplitVacancy}
            onAssignSubClick={props.onAssignSubClick}
            updateDetailAccountingCodes={(accountingCodeId: string | null) => {
              const updatedDetails = props.vacancyDetails.map(vd => {
                return {
                  ...vd,
                  accountingCodeId: accountingCodeId ? accountingCodeId : null,
                };
              });
              props.setVacanciesInput(updatedDetails);
            }}
            updateDetailPayCodes={(payCodeId: string | null) => {
              const updatedDetails = props.vacancyDetails.map(vd => {
                return {
                  ...vd,
                  payCodeId: payCodeId ? payCodeId : null,
                };
              });
              props.setVacanciesInput(updatedDetails);
            }}
            hasEditedDetails={props.hasEditedDetails}
          />
        </div>
      </Grid>

      <Grid item xs={12} className={classes.stickyFooter}>
        <div className={classes.actionButtons}>
          <div className={classes.unsavedText}>
            {props.isFormDirty && (
              <Typography>{t("This page has unsaved changes")}</Typography>
            )}
          </div>
          {props.onDelete && !props.isFormDirty && (
            <Button
              onClick={() => props.onDelete!()}
              variant="text"
              className={classes.deleteButton}
            >
              {t("Delete")}
            </Button>
          )}
          {props.onCancel && props.isFormDirty && (
            <Button
              onClick={() => props.onCancel!()}
              variant="outlined"
              className={classes.cancelButton}
              disabled={!props.isFormDirty}
            >
              {t("Discard Changes")}
            </Button>
          )}
          <Can do={[PermissionEnum.AbsVacSave]}>
            <Button
              type="submit"
              variant="contained"
              className={classes.saveButton}
              disabled={!props.isFormDirty}
            >
              {props.saveLabel ?? t("Create")}
            </Button>
          </Can>
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
  stickyFooter: {
    backgroundColor: "#E3F2FD",
    height: theme.typography.pxToRem(72),
    position: "fixed",
    width: "100%",
    left: "0",
    right: "0",
    bottom: "0",
    boxSizing: "border-box",
    border: "1px solid #d8d8d8",
    paddingTop: theme.typography.pxToRem(16),
    zIndex: 500,
    paddingRight: theme.typography.pxToRem(10),
  },
  deleteButton: {
    color: theme.customColors.darkRed,
    marginRight: theme.spacing(2),
    textDecoration: "underline",
  },
  cancelButton: {
    marginRight: theme.spacing(2),
    color: "#050039",
  },
  saveButton: {
    marginRight: theme.spacing(4),
  },
  select: {
    paddingTop: theme.typography.pxToRem(4),
    paddingBottom: theme.spacing(1),
  },
  spacing: {
    paddingRight: theme.spacing(4),
  },
  subText: {
    color: theme.customColors.edluminSubText,
  },
  unsavedText: {
    marginRight: theme.typography.pxToRem(30),
    marginTop: theme.typography.pxToRem(8),
  },

  substituteDetailsTitle: { paddingBottom: theme.typography.pxToRem(3) },
  substituteDetailsSubtitle: { paddingBottom: theme.typography.pxToRem(1) },
  subDetailsContainer: {
    marginTop: theme.spacing(2),
    border: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    borderRadius: theme.typography.pxToRem(4),
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

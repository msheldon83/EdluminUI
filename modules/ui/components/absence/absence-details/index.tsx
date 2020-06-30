import {
  Button,
  Grid,
  makeStyles,
  Typography,
  useTheme,
} from "@material-ui/core";
import { min, startOfDay, parseISO } from "date-fns";
import { Errors, SetValue, TriggerValidation } from "forms";
import {
  DayPart,
  NeedsReplacement,
  PermissionEnum,
  Vacancy,
  AbsenceDetail,
  ApprovalStatus,
} from "graphql/server-types.gen";
import * as React from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import {
  useAbsenceReasons,
  useAbsenceReasonOptionsWithCategories,
} from "reference-data/absence-reasons";
import { AssignedSub } from "ui/components/absence/assigned-sub";
import { VacancyDetail, AssignmentOnDate } from "ui/components/absence/types";
import { Can } from "ui/components/auth/can";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { SelectNew } from "ui/components/form/select-new";
import { CreateAbsenceCalendar } from "../create-absence-calendar";
import { DayPartField, DayPartValue } from "../day-part-field";
import { NoteField } from "./notes-field";
import { SubstituteRequiredDetails } from "./substitute-required-details";
import { uniqBy } from "lodash-es";
import { ContentFooter } from "../../content-footer";
import {
  BalanceUsage,
  AbsenceReasonUsageData,
} from "ui/components/absence/balance-usage";
import Maybe from "graphql/tsutils/Maybe";
import { format } from "date-fns/esm";
import { canEditAbsVac } from "helpers/permissions";
import { AccountingCodeValue } from "ui/components/form/accounting-code-dropdown";

export type AbsenceDetailsFormData = {
  dayPart?: DayPart;
  absenceReason: string;
  replacementEmployeeId?: string;
  replacementEmployeeName?: string;
  accountingCodeAllocations?: AccountingCodeValue;
  payCode?: string;
  hourlyStartTime?: Date;
  hourlyEndTime?: Date;
  notesToApprover?: string;
  notesToReplacement?: string;
  adminOnlyNotes?: string;
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
  actingAsEmployee?: boolean;
  needsReplacement: NeedsReplacement;
  wantsReplacement: boolean;
  absenceReason?: {
    id: string;
    name: string;
  };
  vacancies: Vacancy[];
  vacancyDetails: VacancyDetail[];
  locationIds?: string[];
  setStep: (S: "absence" | "preAssignSub" | "edit") => void;
  disabledDates: Date[];
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
  replacementEmail?: string;
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
  isClosed: boolean;
  onAssignSubClick: (
    vacancyDetailIds?: string[],
    employeeToReplace?: string
  ) => void;
  hasEditedDetails: boolean;
  assignmentsByDate: AssignmentOnDate[];
  usages: AbsenceReasonUsageData[] | null;
  closedDates?:
    | Maybe<Pick<AbsenceDetail, "id" | "startDate"> | null | undefined>[]
    | null;
  setRequireAdminNotes: React.Dispatch<React.SetStateAction<boolean>>;
  requireAdminNotes: boolean;
  positionTypeId?: string;
  approvalStatus?: ApprovalStatus | null;
};

export const AbsenceDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const history = useHistory();
  const {
    organizationId,
    setValue,
    values,
    actingAsEmployee,
    needsReplacement,
    wantsReplacement,
    onSubstituteWantedChange,
    onSwitchMonth,
    errors,
    triggerValidation,
    assignmentsByDate,
    setRequireAdminNotes,
    requireAdminNotes,
    positionTypeId,
  } = props;

  const [negativeBalanceWarning, setNegativeBalanceWarning] = useState(false);

  const absenceReasonsFromProps =
    props?.absenceReason?.name && props?.absenceReason?.id
      ? [{ label: props.absenceReason.name, value: props.absenceReason.id }]
      : [];

  const absenceReasonOptions = useAbsenceReasonOptionsWithCategories(
    organizationId,
    absenceReasonsFromProps,
    positionTypeId
  );

  const absenceReasons = useAbsenceReasons(organizationId);
  const filteredAbsenceReaons = positionTypeId
    ? absenceReasons.filter(
        ar => ar.positionTypeIds.includes(positionTypeId) || ar.allPositionTypes
      )
    : absenceReasons;

  const startDate = startOfDay(min(props.absenceDates));

  const onReasonChange = React.useCallback(
    async event => {
      await setValue("absenceReason", event.value);
      setRequireAdminNotes(
        filteredAbsenceReaons.find(ar => ar.id === event.value)
          ?.requireNotesToAdmin || false
      );
    },
    [filteredAbsenceReaons, setRequireAdminNotes, setValue]
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

  const onAdminOnlyNotesChange = React.useCallback(
    async event => {
      await setValue("adminOnlyNotes", event.target.value);
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

  const isSplitVacancy = useMemo(() => {
    const uniqueRecords = uniqBy(assignmentsByDate, "assignmentId");
    return uniqueRecords.length > 1;
  }, [assignmentsByDate]);

  const assignmentStartTime = useMemo(() => {
    const details = props.vacancies[0]?.details;
    const startTime =
      details && details[0] ? details[0].startTimeLocal : undefined;
    return startTime ? parseISO(startTime) : undefined;
  }, [props.vacancies]);

  const showClosedDatesBanner = useMemo(() => {
    return props.closedDates && props.closedDates.length > 0;
  }, [props.closedDates]);

  const renderClosedDaysBanner = useMemo(() => {
    if (showClosedDatesBanner) {
      return (
        <ul>
          {props.closedDates?.map((c, i) => {
            return (
              <li key={`closed-${i}`}>
                {format(parseISO(c?.startDate), "EEE MMMM d, yyyy")}
              </li>
            );
          })}
        </ul>
      );
    } else {
      return "";
    }
  }, [showClosedDatesBanner, props.closedDates]);

  return (
    <Grid container className={classes.absenceDetailsContainer}>
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
          selectedAbsenceDates={
            props.closedDates
              ? props.absenceDates.concat(
                  props.closedDates.map(c => parseISO(c?.startDate))
                )
              : props.absenceDates
          }
          employeeId={props.employeeId}
          currentMonth={props.currentMonth}
          onMonthChange={onSwitchMonth}
          onSelectDates={dates => dates.forEach(props.onToggleAbsenceDate)}
        />
        {showClosedDatesBanner && (
          <Grid className={classes.closedDayBanner} item xs={12}>
            <Typography>
              {t("The following days of this absence fall on a closed day:")}
            </Typography>
            {renderClosedDaysBanner}
          </Grid>
        )}

        <BalanceUsage
          orgId={props.organizationId}
          employeeId={props.employeeId}
          startDate={startDate}
          actingAsEmployee={actingAsEmployee}
          usages={props.usages}
          setNegativeBalanceWarning={setNegativeBalanceWarning}
        />

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

        <div className={classes.notesSection}>
          <Typography variant="h6">{t("Notes to administrator")}</Typography>
          <Typography className={classes.subText}>
            {t("Can be seen by the administrator and the employee.")}
          </Typography>

          <NoteField
            onChange={onNotesToApproverChange}
            name={"notesToApprover"}
            isSubmitted={props.isSubmitted}
            initialAbsenceCreation={props.initialAbsenceCreation}
            value={values.notesToApprover}
            validationMessage={errors.notesToApprover}
            required={requireAdminNotes}
          />
        </div>

        {!actingAsEmployee && (
          <div className={classes.notesSection}>
            <Typography variant="h6">{t("Administrator comments")}</Typography>
            <Typography className={classes.subText}>
              {t("Can be seen and edited by administrators only.")}
            </Typography>

            <NoteField
              onChange={onAdminOnlyNotesChange}
              name={"adminOnlyNotes"}
              isSubmitted={props.isSubmitted}
              initialAbsenceCreation={props.initialAbsenceCreation}
              value={values.adminOnlyNotes}
            />
          </div>
        )}
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
            assignmentsByDate={assignmentsByDate}
            email={props.replacementEmail}
            shouldLink={true}
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
            actingAsEmployee={actingAsEmployee}
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
            updateDetailAccountingCodes={(
              accountingCodeAllocations: AccountingCodeValue | null
            ) => {
              const updatedDetails = props.vacancyDetails.map(vd => {
                return {
                  ...vd,
                  accountingCodeAllocations: accountingCodeAllocations
                    ? accountingCodeAllocations
                    : null,
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
            assignmentsByDate={assignmentsByDate}
          />
        </div>
      </Grid>

      <ContentFooter>
        <Grid item xs={12} className={classes.contentFooter}>
          <div className={classes.actionButtons}>
            <div className={classes.unsavedText}>
              {props.isFormDirty && !props.isClosed && (
                <Typography>{t("This page has unsaved changes")}</Typography>
              )}
            </div>
            {props.onDelete && !props.isFormDirty && (
              <Can do={[PermissionEnum.AbsVacDelete]}>
                <Button
                  onClick={() => props.onDelete!()}
                  variant="text"
                  className={classes.deleteButton}
                >
                  {t("Delete")}
                </Button>
              </Can>
            )}
            {props.onCancel && props.isFormDirty && !props.isClosed && (
              <Button
                onClick={() => props.onCancel!()}
                variant="outlined"
                className={classes.cancelButton}
                disabled={!props.isFormDirty}
              >
                {t("Discard Changes")}
              </Button>
            )}
            <Can
              do={(
                permissions: OrgUserPermissions[],
                isSysAdmin: boolean,
                orgId?: string,
                forRole?: Role | null | undefined
              ) =>
                canEditAbsVac(
                  startDate,
                  permissions,
                  isSysAdmin,
                  orgId,
                  props.actingAsEmployee ? "employee" : "admin",
                  props.approvalStatus
                )
              }
            >
              <Button
                form="absence-form"
                type="submit"
                variant="contained"
                className={classes.saveButton}
                disabled={
                  !props.isFormDirty || negativeBalanceWarning || props.isClosed
                }
              >
                {props.saveLabel ?? t("Create")}
              </Button>
            </Can>
          </div>
        </Grid>
      </ContentFooter>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  absenceDetailsContainer: {
    paddingBottom: theme.typography.pxToRem(72),
  },
  actionButtons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  contentFooter: {
    height: theme.typography.pxToRem(72),
    width: theme.customSpacing.contentWidth,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
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
  notesSection: {
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
  closedDayBanner: {
    marginTop: theme.typography.pxToRem(5),
    backgroundColor: theme.customColors.yellow1,
    padding: theme.typography.pxToRem(10),
    borderRadius: theme.typography.pxToRem(4),
  },
}));

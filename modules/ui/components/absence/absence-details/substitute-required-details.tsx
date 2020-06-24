import {
  Button,
  Grid,
  makeStyles,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { Errors, SetValue, TriggerValidation } from "forms";
import {
  PermissionEnum,
  Vacancy,
  NeedsReplacement,
} from "graphql/server-types.gen";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAccountingCodes } from "reference-data/accounting-codes";
import { usePayCodes } from "reference-data/pay-codes";
import { VacancyDetails } from "ui/components/absence/vacancy-details";
import { Can } from "ui/components/auth/can";
import { SelectNew } from "ui/components/form/select-new";
import { DesktopOnly, MobileOnly } from "ui/components/mobile-helpers";
import { AbsenceDetailsFormData } from ".";
import { NoteField } from "./notes-field";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { canAssignSub, canReassignSub } from "helpers/permissions";
import { parseISO } from "date-fns";
import {
  vacancyDetailsHaveDifferentAccountingCodeSelections,
  vacancyDetailsHaveDifferentPayCodeSelections,
} from "../helpers";
import { VacancyDetail, AssignmentOnDate } from "../types";
import {
  AccountingCodeDropdown,
  AccountingCodeValue,
  noAllocation,
} from "ui/components/form/accounting-code-dropdown";

type Props = {
  setValue: SetValue;
  vacancies: Vacancy[];
  vacancyDetails: VacancyDetail[];
  setStep: (step: "absence" | "preAssignSub" | "edit") => void;
  triggerValidation: TriggerValidation;
  organizationId: string;
  actingAsEmployee?: boolean;
  errors: Errors;
  values: AbsenceDetailsFormData;
  replacementEmployeeId?: string;
  replacementEmployeeName?: string;
  arrangeSubButtonTitle?: string;
  disabledDates?: Date[];
  disableReplacementInteractions?: boolean;
  locationIds?: string[];
  disableEditingDatesAndTimes?: boolean;
  isSubmitted: boolean;
  initialAbsenceCreation: boolean;
  needsReplacement: NeedsReplacement;
  wantsReplacement: boolean;
  onSubstituteWantedChange: (wanted: boolean) => void;
  isFormDirty: boolean;
  onCancelAssignment: (
    assignmentId?: string,
    assignmentRowVersion?: string,
    vacancyDetailIds?: string[]
  ) => Promise<void>;
  isSplitVacancy: boolean;
  onAssignSubClick: (
    vacancyDetailIds?: string[],
    employeeToReplace?: string
  ) => void;
  updateDetailAccountingCodes: (
    accountingCodeAllocations: AccountingCodeValue | null
  ) => void;
  updateDetailPayCodes: (payCodeId: string | null) => void;
  hasEditedDetails: boolean;
  assignmentsByDate: AssignmentOnDate[];
};

export const SubstituteRequiredDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    setStep,
    setValue,
    vacancies,
    vacancyDetails,
    organizationId,
    locationIds,
    errors,
    actingAsEmployee,
    values,
    triggerValidation,
    needsReplacement,
    wantsReplacement,
    onSubstituteWantedChange,
    updateDetailAccountingCodes,
    updateDetailPayCodes,
    hasEditedDetails,
  } = props;
  const hasVacancies = !!(props.vacancies && props.vacancies.length);

  const accountingCodes = useAccountingCodes(organizationId, locationIds);

  const accountingCodeOptions = useMemo(
    () => accountingCodes.map(c => ({ label: c.name, value: c.id })),
    [accountingCodes]
  );
  const payCodes = usePayCodes(organizationId);
  const payCodeOptions = useMemo(
    () => payCodes.map(c => ({ label: c.name, value: c.id })),
    [payCodes]
  );

  const hasAccountingCodeOptions = !!(
    accountingCodeOptions && accountingCodeOptions.length
  );
  const hasPayCodeOptions = !!(payCodeOptions && payCodeOptions.length);

  const detailsHaveDifferentAccountingCodes = useMemo(() => {
    if (!hasEditedDetails) {
      return false;
    }

    return vacancyDetailsHaveDifferentAccountingCodeSelections(
      vacancyDetails,
      values.accountingCodeAllocations ? values.accountingCodeAllocations : null
    );
  }, [hasEditedDetails, vacancyDetails, values.accountingCodeAllocations]);

  const detailsHaveDifferentPayCodes = useMemo(() => {
    if (!hasEditedDetails) {
      return false;
    }

    return vacancyDetailsHaveDifferentPayCodeSelections(
      vacancyDetails,
      values.payCode ? values.payCode : null
    );
  }, [hasEditedDetails, vacancyDetails, values.payCode]);

  const onNotesToReplacementChange = React.useCallback(
    async event => {
      await setValue("notesToReplacement", event.target.value);
    },
    [setValue]
  );

  const onAccountingCodeChange = React.useCallback(
    async value => {
      if (!detailsHaveDifferentAccountingCodes && hasEditedDetails) {
        updateDetailAccountingCodes(value);
      }

      await setValue("accountingCodeAllocations", value);
      await triggerValidation({ name: "accountingCodeAllocations" });
    },
    [
      setValue,
      triggerValidation,
      detailsHaveDifferentAccountingCodes,
      updateDetailAccountingCodes,
      hasEditedDetails,
    ]
  );

  const onPayCodeChange = React.useCallback(
    async event => {
      if (!detailsHaveDifferentPayCodes && hasEditedDetails) {
        updateDetailPayCodes(event?.value);
      }

      await setValue("payCode", event?.value);
      await triggerValidation({ name: "payCode" });
    },
    [
      setValue,
      triggerValidation,
      detailsHaveDifferentPayCodes,
      updateDetailPayCodes,
      hasEditedDetails,
    ]
  );

  const onNeedsReplacementChange = React.useCallback(
    event => {
      onSubstituteWantedChange(event.target.checked);
    },
    [onSubstituteWantedChange]
  );

  return (
    <>
      {wantsReplacement && (
        <VacancyDetails
          vacancies={vacancies}
          disabledDates={props.disabledDates}
          onCancelAssignment={props.onCancelAssignment}
          disableReplacementInteractions={props.disableReplacementInteractions}
          onAssignSubClick={props.onAssignSubClick}
          assignmentsByDate={props.assignmentsByDate}
        />
      )}

      <div className={classes.content}>
        {!actingAsEmployee ||
        needsReplacement === NeedsReplacement.Sometimes ? (
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
          <>
            {!actingAsEmployee &&
              (hasAccountingCodeOptions || hasPayCodeOptions) && (
                <Grid item container spacing={4} className={classes.subCodes}>
                  {hasAccountingCodeOptions && (
                    <Can do={[PermissionEnum.AbsVacSaveAccountCode]}>
                      <Grid
                        item
                        xs={
                          hasPayCodeOptions &&
                          (values.accountingCodeAllocations?.type !==
                            "multiple-allocations" ||
                            detailsHaveDifferentAccountingCodes)
                            ? 6
                            : 12
                        }
                      >
                        {detailsHaveDifferentAccountingCodes ? (
                          <>
                            <Typography>{t("Accounting code")}</Typography>
                            <div className={classes.subText}>
                              {t(
                                "Details have different Accounting code selections. Click on Edit Substitute Details below to manage."
                              )}
                            </div>
                          </>
                        ) : (
                          <AccountingCodeDropdown
                            value={
                              values.accountingCodeAllocations ?? noAllocation()
                            }
                            options={accountingCodeOptions}
                            onChange={onAccountingCodeChange}
                            inputStatus={
                              errors.accountingCodeAllocations
                                ? "error"
                                : undefined
                            }
                            validationMessage={
                              errors.accountingCodeAllocations?.message
                            }
                          />
                        )}
                      </Grid>
                    </Can>
                  )}
                  {hasPayCodeOptions && (
                    <Can do={[PermissionEnum.AbsVacSavePayCode]}>
                      <Grid
                        item
                        xs={
                          hasAccountingCodeOptions &&
                          (values.accountingCodeAllocations?.type !==
                            "multiple-allocations" ||
                            detailsHaveDifferentAccountingCodes)
                            ? 6
                            : 12
                        }
                      >
                        <Typography>{t("Pay code")}</Typography>
                        {detailsHaveDifferentPayCodes ? (
                          <div className={classes.subText}>
                            {t(
                              "Details have different Pay code selections. Click on Edit Substitute Details below to manage."
                            )}
                          </div>
                        ) : (
                          <SelectNew
                            value={{
                              value: values.payCode ?? "",
                              label:
                                payCodeOptions.find(
                                  a => a.value === values.payCode
                                )?.label || "",
                            }}
                            onChange={onPayCodeChange}
                            options={payCodeOptions}
                            multiple={false}
                            inputStatus={errors.payCode ? "error" : undefined}
                            validationMessage={errors.payCode?.message}
                          />
                        )}
                      </Grid>
                    </Can>
                  )}
                </Grid>
              )}

            <div className={classes.notesForReplacement}>
              <Typography variant="h6">{t("Notes to substitute")}</Typography>
              <Typography
                className={[
                  classes.subText,
                  classes.substituteDetailsSubtitle,
                ].join(" ")}
              >
                {t(
                  "Can be seen by the substitute, administrator and employee."
                )}
              </Typography>
              <NoteField
                onChange={onNotesToReplacementChange}
                name={"notesToReplacement"}
                isSubmitted={props.isSubmitted}
                initialAbsenceCreation={props.initialAbsenceCreation}
                value={values.notesToReplacement}
              />
            </div>

            {hasVacancies && (
              <div className={classes.substituteActions}>
                {!props.isSplitVacancy && (
                  <>
                    <Can
                      do={(
                        permissions: OrgUserPermissions[],
                        isSysAdmin: boolean,
                        orgId?: string,
                        forRole?: Role | null | undefined
                      ) =>
                        canAssignSub(
                          parseISO(vacancies[0].startDate),
                          permissions,
                          isSysAdmin,
                          orgId,
                          forRole
                        )
                      }
                    >
                      <Button
                        variant="outlined"
                        className={classes.preArrangeButton}
                        onClick={() => props.onAssignSubClick()}
                        disabled={
                          props.disableReplacementInteractions ||
                          props.replacementEmployeeId !== undefined ||
                          (props.isFormDirty && !!props.arrangeSubButtonTitle)
                        }
                      >
                        {props.arrangeSubButtonTitle ?? t("Pre-arrange")}
                      </Button>
                    </Can>
                    {props.replacementEmployeeId !== undefined &&
                      props.arrangeSubButtonTitle && (
                        <Can
                          do={(
                            permissions: OrgUserPermissions[],
                            isSysAdmin: boolean,
                            orgId?: string,
                            forRole?: Role | null | undefined
                          ) =>
                            canReassignSub(
                              parseISO(vacancies[0].startDate),
                              permissions,
                              isSysAdmin,
                              orgId,
                              forRole
                            )
                          }
                        >
                          <Button
                            variant="outlined"
                            className={classes.reassignButton}
                            onClick={() => props.onAssignSubClick()}
                            disabled={props.disableReplacementInteractions}
                          >
                            {t("Reassign Sub")}
                          </Button>
                        </Can>
                      )}
                  </>
                )}

                <Can do={[PermissionEnum.AbsVacSave]}>
                  <Button
                    variant="outlined"
                    onClick={() => setStep("edit")}
                    disabled={props.disableEditingDatesAndTimes}
                  >
                    <DesktopOnly>{t("Edit Substitute Details")}</DesktopOnly>
                    <MobileOnly>{t("Edit Details")}</MobileOnly>
                  </Button>
                </Can>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  subText: {
    color: theme.customColors.edluminSubText,
  },
  content: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(),
  },
  substituteDetailsSubtitle: { paddingBottom: theme.typography.pxToRem(1) },
  container: {
    padding: theme.spacing(2),
  },
  notesForReplacement: {
    paddingTop: theme.spacing(3),
  },
  readonlyNotes: { paddingTop: theme.spacing(2) },
  subCodes: {
    paddingTop: theme.spacing(2),
  },
  preArrangeButton: {
    marginRight: theme.spacing(2),
  },
  substituteActions: {
    marginTop: theme.spacing(2),
  },
  substituteRequiredText: {
    fontStyle: "italic",
  },
  reassignButton: {
    marginLeft: theme.typography.pxToRem(-140),
    marginRight: theme.spacing(2),
  },
}));

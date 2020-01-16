import {
  Button,
  Chip,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { Errors, SetValue, TriggerValidation } from "forms";
import { Vacancy, PermissionEnum } from "graphql/server-types.gen";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAccountingCodes } from "reference-data/accounting-codes";
import { usePayCodes } from "reference-data/pay-codes";
import { VacancyDetails } from "ui/components/absence/vacancy-details";
import { SelectNew } from "ui/components/form/select-new";
import { AbsenceDetailsFormData } from ".";
import { DisabledDate } from "helpers/absence/computeDisabledDates";
import { Can } from "ui/components/auth/can";
import { DesktopOnly, MobileOnly } from "ui/components/mobile-helpers";

type Props = {
  setValue: SetValue;
  vacancies: Vacancy[];
  setStep: (step: "absence" | "preAssignSub" | "edit") => void;
  triggerValidation: TriggerValidation;
  organizationId: string;
  isAdmin: boolean;
  errors: Errors;
  values: AbsenceDetailsFormData;
  replacementEmployeeId?: number;
  replacementEmployeeName?: string;
  arrangeSubButtonTitle?: string;
  disabledDates?: DisabledDate[];
  disableReplacementInteractions?: boolean;
  locationIds?: number[];
  disableEditingDatesAndTimes?: boolean;
};

export const SubstituteRequiredDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const textFieldClasses = useTextFieldClasses();
  const { t } = useTranslation();

  const {
    setStep,
    setValue,
    vacancies,
    organizationId,
    locationIds,
    errors,
    isAdmin,
    values,
    triggerValidation,
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

  const onNotesToReplacementChange = React.useCallback(
    async event => {
      await setValue("notesToReplacement", event.target.value);
    },
    [setValue]
  );

  const onAccountingCodeChange = React.useCallback(
    async event => {
      await setValue("accountingCode", event?.value);
      await triggerValidation({ name: "accountingCode" });
    },
    [setValue, triggerValidation]
  );

  const onPayCodeChange = React.useCallback(
    async event => {
      await setValue("payCode", event?.value);
      await triggerValidation({ name: "payCode" });
    },
    [setValue, triggerValidation]
  );

  return (
    <>
      <VacancyDetails
        vacancies={vacancies}
        disabledDates={props.disabledDates}
        equalWidthDetails
      />

      {isAdmin && (hasAccountingCodeOptions || hasPayCodeOptions) && (
        <Grid item container spacing={4} className={classes.subCodes}>
          {hasAccountingCodeOptions && (
            <Can do={[PermissionEnum.AbsVacSaveAccountCode]}>
              <Grid item xs={hasPayCodeOptions ? 6 : 12}>
                <Typography>{t("Accounting code")}</Typography>
                <SelectNew
                  value={{
                    value: values.accountingCode ?? "",
                    label:
                      accountingCodeOptions.find(
                        a => a.value === values.accountingCode
                      )?.label || "",
                  }}
                  onChange={onAccountingCodeChange}
                  options={accountingCodeOptions}
                  multiple={false}
                  inputStatus={errors.accountingCode ? "error" : undefined}
                  validationMessage={errors.accountingCode?.message}
                />
              </Grid>
            </Can>
          )}
          {hasPayCodeOptions && (
            <Can do={[PermissionEnum.AbsVacSavePayCode]}>
              <Grid item xs={hasAccountingCodeOptions ? 6 : 12}>
                <Typography>{t("Pay code")}</Typography>
                <SelectNew
                  value={{
                    value: values.payCode ?? "",
                    label:
                      payCodeOptions.find(a => a.value === values.payCode)
                        ?.label || "",
                  }}
                  onChange={onPayCodeChange}
                  options={payCodeOptions}
                  multiple={false}
                  inputStatus={errors.payCode ? "error" : undefined}
                  validationMessage={errors.payCode?.message}
                />
              </Grid>
            </Can>
          )}
        </Grid>
      )}

      <div className={classes.notesForReplacement}>
        <Typography variant="h6">{t("Notes for substitute")}</Typography>
        <Typography
          className={[classes.subText, classes.substituteDetailsSubtitle].join(
            " "
          )}
        >
          {t("Can be seen by the substitute, administrator and employee.")}
        </Typography>
        <TextField
          name="notesToReplacement"
          multiline
          rows="6"
          variant="outlined"
          margin="normal"
          fullWidth
          onChange={onNotesToReplacementChange}
          InputProps={{ classes: textFieldClasses }}
        />
      </div>

      {hasVacancies && (
        <div className={classes.substituteActions}>
          <Can do={[PermissionEnum.AbsVacAssign]}>
            <Button
              variant="outlined"
              className={classes.preArrangeButton}
              onClick={() => setStep("preAssignSub")}
              disabled={
                props.disableReplacementInteractions ||
                props.replacementEmployeeId !== undefined
              }
            >
              {props.arrangeSubButtonTitle ?? t("Pre-arrange")}
            </Button>
          </Can>

          <Button
            variant="outlined"
            onClick={() => setStep("edit")}
            disabled={props.disableEditingDatesAndTimes}
          >
            <DesktopOnly>{t("Edit Substitute Details")}</DesktopOnly>
            <MobileOnly>{t("Edit Details")}</MobileOnly>
          </Button>
        </div>
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  subText: {
    color: theme.customColors.darkGray,
  },
  substituteDetailsSubtitle: { paddingBottom: theme.typography.pxToRem(1) },
  container: {
    padding: theme.spacing(2),
  },
  notesForReplacement: {
    paddingTop: theme.spacing(3),
  },
  subCodes: {
    paddingTop: theme.spacing(2),
  },
  preArrangeButton: {
    marginRight: theme.spacing(2),
  },
  substituteActions: {
    marginTop: theme.spacing(2),
  },
}));

const useTextFieldClasses = makeStyles(theme => ({
  multiline: {
    padding: theme.spacing(1),
  },
}));

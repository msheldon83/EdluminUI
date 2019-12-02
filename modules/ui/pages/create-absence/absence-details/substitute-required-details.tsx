import {
  Button,
  Chip,
  makeStyles,
  TextField,
  Typography,
  Grid,
} from "@material-ui/core";
import { Errors, SetValue, TriggerValidation } from "forms";
import { Vacancy } from "graphql/server-types.gen";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAccountingCodes } from "reference-data/accounting-codes";
import { usePayCodes } from "reference-data/pay-codes";
import { VacancyDetails } from "ui/components/absence/vacancy-details";
import { Step } from "../step-params";
import { Select } from "ui/components/form/select";
import { CreateAbsenceFormData } from "../ui";

type Props = {
  setValue: SetValue;
  replacementEmployeeName?: string;
  replacementEmployeeId?: number;
  vacancies: Vacancy[];
  setStep: (S: Step) => void;
  triggerValidation: TriggerValidation;
  organizationId: string;
  isAdmin: boolean;
  errors: Errors;
  values: CreateAbsenceFormData;
};

export const SubstituteRequiredDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const textFieldClasses = useTextFieldClasses();
  const { t } = useTranslation();

  const {
    setValue,
    vacancies,
    setStep,
    organizationId,
    errors,
    isAdmin,
    values,
    triggerValidation,
  } = props;
  const hasVacancies = !!(props.vacancies && props.vacancies.length);

  const accountingCodes = useAccountingCodes(organizationId);
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

  const removePrearrangedReplacementEmployee = async () => {
    await setValue("replacementEmployeeId", undefined);
    await setValue("replacementEmployeeName", undefined);
  };

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
      <VacancyDetails vacancies={vacancies} equalWidthDetails />

      {isAdmin && (hasAccountingCodeOptions || hasPayCodeOptions) && (
        <Grid item container spacing={4} className={classes.aubCodes}>
          {hasAccountingCodeOptions && (
            <Grid item xs={hasPayCodeOptions ? 6 : 12}>
              <Typography>{t("Accounting code")}</Typography>
              <Select
                value={{
                  value: values.accountingCode,
                  label:
                    accountingCodeOptions.find(
                      a => a.value === values.accountingCode
                    )?.label || "",
                }}
                onChange={onAccountingCodeChange}
                options={accountingCodeOptions}
                isClearable={!!values.accountingCode}
                inputStatus={errors.accountingCode ? "error" : undefined}
                validationMessage={errors.accountingCode?.message}
              />
            </Grid>
          )}
          {hasPayCodeOptions && (
            <Grid item xs={hasAccountingCodeOptions ? 6 : 12}>
              <Typography>{t("Pay code")}</Typography>
              <Select
                value={{
                  value: values.payCode,
                  label:
                    payCodeOptions.find(a => a.value === values.payCode)
                      ?.label || "",
                }}
                onChange={onPayCodeChange}
                options={payCodeOptions}
                isClearable={!!values.payCode}
                inputStatus={errors.payCode ? "error" : undefined}
                validationMessage={errors.payCode?.message}
              />
            </Grid>
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

      {props.replacementEmployeeId && props.replacementEmployeeName && (
        <div className={classes.preArrangedChip}>
          <Chip
            label={`${t("Pre-arranged")}: ${props.replacementEmployeeName}`}
            color={"primary"}
            onDelete={async () => {
              await removePrearrangedReplacementEmployee();
            }}
          />
        </div>
      )}

      {hasVacancies && (
        <div>
          <Button variant="outlined" onClick={() => setStep("preAssignSub")}>
            {t("Pre-arrange")}
          </Button>

          <Button variant="outlined" onClick={() => setStep("edit")}>
            {t("Edit")}
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
  preArrangedChip: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  aubCodes: {
    paddingTop: theme.spacing(2),
  },
}));

const useTextFieldClasses = makeStyles(theme => ({
  multiline: {
    padding: theme.spacing(1),
  },
}));

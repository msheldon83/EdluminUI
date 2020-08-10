import * as React from "react";
import { useAccountingCodes } from "reference-data/accounting-codes";
import { usePayCodes } from "reference-data/pay-codes";
import { useTranslation } from "react-i18next";
import { Grid, Typography, makeStyles } from "@material-ui/core";
import { Can } from "ui/components/auth/can";
import { PermissionEnum } from "graphql/server-types.gen";
import {
  AccountingCodeDropdown,
  noAllocation,
  AccountingCodeValue,
} from "ui/components/form/accounting-code-dropdown";
import { useFormikContext } from "formik";
import { AbsenceFormData } from "../types";
import { SelectNew } from "ui/components/form/select-new";

type Props = {
  organizationId: string;
  locationIds?: string[];
  detailsHaveDifferentAccountingCodes: boolean;
  detailsHaveDifferentPayCodes: boolean;
  onOverallCodeChanges: (details: {
    accountingCodeValue?: AccountingCodeValue;
    payCodeId?: string | null;
  }) => void;
};

export const SubstituteDetailsCodes: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const {
    organizationId,
    locationIds,
    detailsHaveDifferentAccountingCodes,
    detailsHaveDifferentPayCodes,
    onOverallCodeChanges,
  } = props;

  const { values, errors, setFieldValue } = useFormikContext<AbsenceFormData>();

  const accountingCodes = useAccountingCodes(organizationId, locationIds);
  const accountingCodeOptions = React.useMemo(
    () => accountingCodes.map(c => ({ label: c.name, value: c.id })),
    [accountingCodes]
  );
  const payCodes = usePayCodes(organizationId);
  const payCodeOptions = React.useMemo(
    () => payCodes.map(c => ({ label: c.name, value: c.id })),
    [payCodes]
  );

  const hasAccountingCodeOptions = !!(
    accountingCodeOptions && accountingCodeOptions.length
  );
  const hasPayCodeOptions = !!(payCodeOptions && payCodeOptions.length);

  if (!hasAccountingCodeOptions && !hasPayCodeOptions) {
    // Nothing to show to the User
    return null;
  }

  return (
    <Grid item container spacing={4}>
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
                value={values.accountingCodeAllocations ?? noAllocation()}
                options={accountingCodeOptions}
                onChange={value => {
                  setFieldValue(
                    "accountingCodeAllocations",
                    value,
                    !!errors.accountingCodeAllocations
                  );
                  onOverallCodeChanges({ accountingCodeValue: value });
                }}
                inputStatus={
                  errors.accountingCodeAllocations ? "error" : undefined
                }
                validationMessage={
                  errors.accountingCodeAllocations
                    ? errors.accountingCodeAllocations
                    : undefined
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
                  value: values.payCodeId ?? "",
                  label:
                    payCodeOptions.find(a => a.value === values.payCodeId)
                      ?.label || "",
                }}
                onChange={value => {
                  setFieldValue("payCodeId", value.value, !!errors.payCodeId);
                  onOverallCodeChanges({
                    payCodeId: !value.value ? null : value.value.toString(),
                  });
                }}
                options={payCodeOptions}
                multiple={false}
                inputStatus={errors.payCodeId ? "error" : undefined}
                validationMessage={errors.payCodeId}
              />
            )}
          </Grid>
        </Can>
      )}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  subText: {
    color: theme.customColors.edluminSubText,
  },
}));

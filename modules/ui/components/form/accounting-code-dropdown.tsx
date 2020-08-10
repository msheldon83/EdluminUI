import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import {
  AllocationDropdown,
  AllocationDropdownProps,
  AllocationCodeValue,
  RenderAllocationAmountArgs,
} from "./allocation-dropdown";
export {
  singleAllocation,
  noAllocation,
  multipleAllocations,
} from "./allocation-dropdown";
import { NumberInput } from "ui/components/form/number-input";

export type AccountingCodeValue = AllocationCodeValue;

type AccountingCodeDropdownProps = AllocationDropdownProps & {};

export const AccountingCodeDropdown = (props: AccountingCodeDropdownProps) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <AllocationDropdown
      {...props}
      multipleAllocationPlaceholder={t("Select accounting code")}
      placeholder={t("Select code")}
      label={t("Accounting code")}
      renderAllocationAmount={(allocationProps: RenderAllocationAmountArgs) => {
        return (
          <NumberInput
            {...allocationProps}
            className={classes.multiCodeInput}
            endAdornment="%"
            maxLengthBeforeDecimal={3}
            maxLengthAfterDecimal={2}
          />
        );
      }}
    />
  );
};

const useStyles = makeStyles(theme => ({
  multiCodeInput: {
    marginLeft: theme.spacing(0.5),
    width: theme.spacing(8),
  },
}));

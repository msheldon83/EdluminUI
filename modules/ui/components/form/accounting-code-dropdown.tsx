import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import {
  AllocationDropdown,
  AllocationDropdownProps,
  AllocationCodeValue,
} from "./allocation-dropdown";
export {
  singleAllocation,
  noAllocation,
  multipleAllocations,
} from "./allocation-dropdown";

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
    />
  );
};

const useStyles = makeStyles(theme => ({}));

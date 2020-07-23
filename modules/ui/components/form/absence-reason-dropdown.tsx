import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import {
  AllocationDropdown,
  AllocationDropdownProps,
  AllocationCodeValue,
} from "./allocation-dropdown";

type AbsenceReasonDropdownProps = AllocationDropdownProps & {};

export type AbsenceReasonDropdownValue = AllocationCodeValue;

export const AbsenceReasonDropdown = (props: AbsenceReasonDropdownProps) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <AllocationDropdown
      {...props}
      multipleAllocationPlaceholder={t("Select reason")}
      placeholder={t("Select code")}
      label={t("Reason")}
    />
  );
};

const useStyles = makeStyles(theme => ({}));

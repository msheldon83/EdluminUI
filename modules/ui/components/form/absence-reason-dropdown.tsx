import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import {
  AllocationDropdown,
  AllocationDropdownProps,
  AllocationCodeValue,
  RenderAllocationAmountArgs,
} from "./allocation-dropdown";
import { NumberInput } from "ui/components/form/number-input";

type AbscenceAllocationType = "DAYS" | "HOURS";

type AbsenceReasonDropdownProps = AllocationDropdownProps<
  AbscenceAllocationType
> & {};

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
      renderAllocationAmount={(allocationProps: RenderAllocationAmountArgs) => {
        return (
          <>
            <NumberInput
              {...allocationProps}
              className={classes.hoursInput}
              endAdornment={t("hrs")}
              maxLength={2}
            />
            <NumberInput
              {...allocationProps}
              className={classes.daysInput}
              endAdornment={t("days")}
              maxLength={2}
            />
          </>
        );
      }}
    />
  );
};

const useStyles = makeStyles(theme => ({
  hoursInput: {
    marginRight: theme.spacing(1),
    width: theme.spacing(8.5),
  },
  daysInput: {
    width: theme.spacing(9.5),
  },
}));

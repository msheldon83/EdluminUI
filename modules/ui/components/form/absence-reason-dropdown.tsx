import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import {
  AllocationDropdown,
  AllocationDropdownProps,
  AllocationCodeValue,
  RenderAllocationAmountArgs,
  MULTIPLE_ALLOCATIONS,
} from "./allocation-dropdown";
import { NumberInput } from "ui/components/form/number-input";

type AbsenceReasonDropdownProps = Pick<
  AllocationDropdownProps,
  | "value"
  | "placeholder"
  | "multipleAllocationPlaceholder"
  | "label"
  | "options"
  | "onChange"
  | "showLabel"
  | "disabled"
  | "inputStatus"
  | "validationMessage"
> & {
  hoursInADay: number;
};

export type AbsenceReasonDropdownValue = AllocationCodeValue;

export const AbsenceReasonDropdown = ({
  hoursInADay,
  ...props
}: AbsenceReasonDropdownProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();

  const amountInputVisibleness = () => {
    switch (props.value?.type) {
      case MULTIPLE_ALLOCATIONS: {
        return {
          daysVisible: props.value?.allocations.some(
            allocation => allocation.selection?.descriptor === "DAYS"
          ),
          hoursVisible: props.value?.allocations.some(
            allocation => allocation.selection?.descriptor === "HOURS"
          ),
        };
      }

      default: {
        return {
          daysVisible: false,
          hoursVisible: false,
        };
      }
    }
  };

  const { hoursVisible, daysVisible } = amountInputVisibleness();

  const daysToHours = (days?: number) => {
    if (days === undefined) {
      return undefined;
    }

    return days * hoursInADay;
  };

  const hoursToDays = (hours?: number) => {
    if (hours === undefined) {
      return undefined;
    }

    return hours / hoursInADay;
  };

  return (
    <AllocationDropdown
      {...props}
      multipleAllocationPlaceholder={t("Select reason")}
      placeholder={t("Select code")}
      label={t("Reason")}
      renderAllocationsHeaders={() => {
        return (
          <div role="row" className={classes.allocationHeaders}>
            <div role="columnheader" style={{ flex: "1 0 auto" }} />
            {hoursVisible && (
              <div
                role="columnheader"
                style={{
                  transform: "translateX(-10px)",
                  paddingBottom: theme.spacing(0.5),
                }}
                className={classes.hoursInputColumn}
              >
                {t("Hours")}
              </div>
            )}
            {daysVisible && (
              <div
                role="columnheader"
                style={{
                  transform: "translateX(-10px)",
                  paddingBottom: theme.spacing(0.5),
                }}
                className={classes.daysInputColumn}
              >
                {t("Days")}
              </div>
            )}
            <div
              role="columnheader"
              style={{ width: theme.typography.pxToRem(16) }}
            />
          </div>
        );
      }}
      renderAllocationAmount={({
        selection,
        value,
        ...allocationProps
      }: RenderAllocationAmountArgs) => {
        const hoursDisabled = !selection || selection?.descriptor === "DAYS";
        const daysDisabled = !selection || selection?.descriptor === "HOURS";

        return selection ? (
          <div className={classes.allocationAmountWrapper} role="cell">
            {hoursVisible && (
              <NumberInput
                {...allocationProps}
                value={value}
                className={classes.hoursInputColumn}
                maxLength={3}
                disabled={allocationProps.disabled || hoursDisabled}
              />
            )}
            {daysVisible && (
              <NumberInput
                {...allocationProps}
                onChange={days => {
                  allocationProps.onChange(daysToHours(days));
                }}
                value={hoursToDays(value)}
                className={classes.daysInputColumn}
                maxLength={3}
                disabled={allocationProps.disabled || daysDisabled}
              />
            )}
          </div>
        ) : (
          <div />
        );
      }}
    />
  );
};

const useStyles = makeStyles(theme => ({
  hoursInputColumn: {
    marginRight: theme.spacing(1),
    width: theme.spacing(10),
    textAlign: "left",
  },
  daysInputColumn: {
    width: theme.spacing(11),
    textAlign: "left",
  },
  allocationAmountWrapper: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  allocationHeaders: {
    display: "flex",
  },
}));

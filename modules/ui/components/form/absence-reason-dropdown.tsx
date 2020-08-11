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

  const { hoursVisible, daysVisible } = (() => {
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
  })();

  const renderAllocationAmount = ({
    selection,
    value,
    allocationType,
    ...allocationProps
  }: RenderAllocationAmountArgs) => {
    const hoursDisabled =
      !selection ||
      selection?.descriptor === "DAYS" ||
      allocationProps.disabled;
    const daysDisabled =
      !selection ||
      selection?.descriptor === "HOURS" ||
      allocationProps.disabled;

    /*
      Only convert the allocation amount when absolutely necessary
    */
    const hoursValue =
      allocationType === "DAYS" && value
        ? daysToHours(value, hoursInADay)
        : value;
    const daysValue =
      allocationType === "HOURS" && value
        ? hoursToDays(value, hoursInADay)
        : value;

    return selection ? (
      <div className={classes.allocationAmountWrapper} role="cell">
        {hoursVisible && (
          <NumberInput
            {...allocationProps}
            onChange={e => allocationProps.onChange(e.target.value)}
            value={hoursValue}
            className={classes.hoursInputColumn}
            maxLengthBeforeDecimal={2}
            maxLengthAfterDecimal={2}
            disabled={hoursDisabled}
          />
        )}
        {daysVisible && (
          <NumberInput
            {...allocationProps}
            onChange={e => allocationProps.onChange(e.target.value)}
            value={daysValue}
            className={classes.daysInputColumn}
            maxLengthBeforeDecimal={1}
            maxLengthAfterDecimal={2}
            disabled={daysDisabled}
          />
        )}
      </div>
    ) : (
      <div />
    );
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
      renderAllocationAmount={renderAllocationAmount}
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

function daysToHours(days: string, hoursInADay: number) {
  return (+days * hoursInADay).toString();
}

function hoursToDays(hours: string, hoursInADay: number) {
  return (+hours / hoursInADay).toString();
}

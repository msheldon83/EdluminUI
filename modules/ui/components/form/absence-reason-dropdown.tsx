import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import {
  AllocationDropdown,
  AllocationDropdownProps,
  AllocationCodeValue,
  RenderAllocationAmountArgs,
  MULTIPLE_ALLOCATIONS,
} from "./allocation-dropdown";
import { NumberInput } from "ui/components/form/number-input";

type AbsenceReasonDropdownProps = AllocationDropdownProps & {
  hoursInADay: number;
};

export type AbsenceReasonDropdownValue = AllocationCodeValue;

export const AbsenceReasonDropdown = ({
  hoursInADay,
  ...props
}: AbsenceReasonDropdownProps) => {
  const classes = useStyles();
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
      renderAllocationAmount={({
        selection,
        value,
        ...allocationProps
      }: RenderAllocationAmountArgs) => {
        const hoursDisabled = !selection || selection?.descriptor === "DAYS";
        const daysDisabled = !selection || selection?.descriptor === "HOURS";

        console.log("days value", hoursToDays(value));

        return selection ? (
          <div className={classes.allocationAmountWrapper}>
            {hoursVisible && (
              <NumberInput
                {...allocationProps}
                value={value}
                className={classes.hoursInput}
                endAdornment={t("hrs")}
                maxLength={3}
                disabled={allocationProps.disabled || hoursDisabled}
              />
            )}
            {daysVisible && (
              <NumberInput
                {...allocationProps}
                onChange={days => {
                  console.log(daysToHours(days));
                  allocationProps.onChange(daysToHours(days));
                }}
                value={hoursToDays(value)}
                className={classes.daysInput}
                endAdornment={t("days")}
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
  hoursInput: {
    marginRight: theme.spacing(1),
    width: theme.spacing(10),
  },
  daysInput: {
    width: theme.spacing(11),
  },
  allocationAmountWrapper: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
}));

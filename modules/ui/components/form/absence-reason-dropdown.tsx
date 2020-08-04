import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import {
  AllocationDropdown,
  AllocationDropdownProps,
  AllocationCodeValue,
  RenderAllocationAmountArgs,
  NO_ALLOCATION,
  SINGLE_ALLOCATION,
  MULTIPLE_ALLOCATIONS,
} from "./allocation-dropdown";
import { NumberInput } from "ui/components/form/number-input";

type AbsenceReasonDropdownProps = AllocationDropdownProps & {
  totalHours: number;
  totalDays: number;
};

export type AbsenceReasonDropdownValue = AllocationCodeValue;

export const AbsenceReasonDropdown = ({
  totalHours,
  totalDays,
  ...props
}: AbsenceReasonDropdownProps) => {
  const classes = useStyles();
  const { t } = useTranslation();

  // const { hoursDisabled, daysDisabled } = generateInputDisabledValues(
  //   props.value?.type,
  //   props.value?.selection?.descriptor
  // );

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

  const amountInputValues = (
    hoursDisabled: boolean,
    daysDisabled: boolean,
    amount?: number
  ) => {
    /*
    TODO: determine how many hours in a day

    For example:

    totals are
    1.5 days --- 8 hours

    hours/days === how many hours in a day
    */
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

        console.log("value", value);

        return (
          <>
            {hoursVisible && (
              <NumberInput
                {...allocationProps}
                value={value}
                className={classes.hoursInput}
                endAdornment={t("hrs")}
                maxLength={2}
                disabled={allocationProps.disabled || hoursDisabled}
              />
            )}
            {daysVisible && (
              <NumberInput
                {...allocationProps}
                value={value}
                className={classes.daysInput}
                endAdornment={t("days")}
                maxLength={2}
                disabled={allocationProps.disabled || daysDisabled}
              />
            )}
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

// function generateInputDisabledValues(type?: string, descriptor?: string) {
//   switch (type) {
//     case SINGLE_ALLOCATION: {
//       return {
//         hoursDisabled: descriptor?.toLowerCase() === "hours",
//         daysDisabled: descriptor?.toLowerCase() === "days",
//       };
//     }

//     case MULTIPLE_ALLOCATIONS:
//     case NO_ALLOCATION:
//     default: {
//       return {
//         hoursDisabled: false,
//         daysDisabled: false,
//       };
//     }
//   }
// }

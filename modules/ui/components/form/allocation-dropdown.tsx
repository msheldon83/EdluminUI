import * as React from "react";
import clsx from "clsx";
import memoize from "lodash-es/memoize";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import { SelectNew as Select, OptionType } from "./select-new";
import { Input } from "./input";
import { NumberInput } from "./number-input";
import { TextButton } from "ui/components/text-button";
import { FormHelperText } from "@material-ui/core";

export type AllocationDropdownProps = {
  value?: AllocationCodeValue;
  placeholder?: string;
  multipleAllocationPlaceholder?: string;
  label?: string;
  options: OptionType[];
  onChange: (value: AllocationCodeValue) => void;
  showLabel?: boolean;
  disabled?: boolean;
  inputStatus?: "warning" | "error" | "success" | "default" | undefined | null;
  validationMessage?: string;
};

export type AllocationCodeValue =
  | { type: "no-allocation"; selection: undefined }
  | { type: "single-allocation"; selection?: OptionType }
  | {
      type: "multiple-allocations";
      selection?: OptionType;
      allocations: Allocation[];
    };

type Allocation = {
  id: number;
  selection?: OptionType;
  percentage?: number;
};

/*
  Helpers to generate values

  These are helpers to generate valid values that make the type checker happy. The
  value not simple, so these should make it easier.

  Use them to send initial date into the dropdown from data stored on the server
*/

// Used when there is no code selected
export const noAllocation = (): AllocationCodeValue => ({
  type: "no-allocation",
  selection: undefined,
});

// Used when only a single code is selected
export const singleAllocation = (
  selection?: OptionType
): AllocationCodeValue => ({
  type: "single-allocation",
  selection,
});

// Used when allocated to multiple codes
export const multipleAllocations = (
  allocations: Allocation[],
  selection?: OptionType
): AllocationCodeValue => ({
  type: "multiple-allocations",
  selection,
  allocations,
});

const newAllocation = (): Allocation => ({
  id: Math.random(),
});

export const AllocationDropdown = (props: AllocationDropdownProps) => {
  const {
    value,
    options,
    onChange,
    validationMessage,
    disabled = false,
    showLabel = true,
    label,
    inputStatus = "default",
    placeholder,
    multipleAllocationPlaceholder,
  } = props;

  const classes = useStyles();
  const { t } = useTranslation();

  const isError = inputStatus === "error";

  const inputClasses = clsx({
    [classes.input]: true,
    [classes.inputMultiCode]: value?.type === "multiple-allocations",
  });

  const handleSelectOnChange = (selection: OptionType) => {
    switch (selection.value) {
      case "multiple-allocations": {
        onChange(multipleAllocations([newAllocation()], selection));
        break;
      }
      case "": {
        resetAllocation();
        break;
      }
      default: {
        onChange(singleAllocation(selection));
      }
    }
  };

  const resetAllocation = () => {
    onChange({ type: "no-allocation", selection: undefined });
  };

  const handleAddAllocation = () => {
    if (value?.type !== "multiple-allocations") {
      return;
    }

    onChange({
      ...value,
      allocations: value?.allocations.concat(newAllocation()),
    });
  };

  const removeAllocation = (id: number) => {
    if (value?.type !== "multiple-allocations") {
      return;
    }

    const updatedAllocations = value?.allocations.filter(
      allocation => allocation.id !== id
    );

    if (updatedAllocations.length === 0) {
      return resetAllocation();
    }

    onChange({
      ...value,
      allocations: updatedAllocations,
    });
  };

  const updateAllocation = (allocationToUpdate: Allocation) => {
    if (value?.type !== "multiple-allocations") {
      return;
    }

    const updatedAllocations = value?.allocations.map(allocation => {
      if (allocation.id !== allocationToUpdate.id) {
        return allocation;
      }

      return allocationToUpdate;
    });

    onChange({
      ...value,
      allocations: updatedAllocations,
    });
  };

  const multipleAllocationsOptionType: OptionType = {
    label: t("Multiple allocations"),
    value: "multiple-allocations",
  };
  const mainDropdownOptions = [multipleAllocationsOptionType].concat(options);

  const renderMultiCodeRow = memoize((allocation: Allocation) => {
    return (
      <>
        <Select
          value={allocation.selection ?? { value: "", label: "" }}
          className={classes.multiCodeSelect}
          options={options}
          placeholder={multipleAllocationPlaceholder}
          multiple={false}
          disabled={disabled}
          readOnly
          withResetValue={false}
          onChange={selection => updateAllocation({ ...allocation, selection })}
        />
        <NumberInput
          className={classes.multiCodeInput}
          endAdornment="%"
          onChange={percentage => {
            updateAllocation({ ...allocation, percentage: percentage });
          }}
          value={allocation.percentage}
          maxLength={2}
          disabled={disabled}
        />
        <span className={classes.multiCodeDeleteButton}>
          <IconButton
            aria-label="delete"
            role="button"
            disableFocusRipple
            size="small"
            onClick={() => removeAllocation(allocation.id)}
            disabled={disabled}
          >
            <DeleteIcon />
          </IconButton>
        </span>
      </>
    );
  });

  return (
    <div className={classes.container}>
      <Select
        value={
          value?.type === "multiple-allocations"
            ? multipleAllocationsOptionType
            : value?.selection ?? { value: "", label: "" }
        }
        label={showLabel ? label : undefined}
        placeholder={placeholder}
        options={mainDropdownOptions}
        disabled={disabled}
        readOnly={value?.type === "multiple-allocations"}
        doSort={false}
        multiple={false}
        onChange={handleSelectOnChange}
        inputClassName={inputClasses}
        inputStatus={inputStatus}
        validationMessage={
          value?.type !== "multiple-allocations" ? validationMessage : undefined
        }
      />

      {value?.type === "multiple-allocations" && (
        <>
          <div
            className={clsx({
              [classes.multiCodeInputContainer]: true,
              [classes.error]: isError,
            })}
          >
            <ul className={classes.multiCodeList}>
              {value?.allocations.map(allocation => {
                return (
                  <li key={allocation.id.toString()}>
                    {renderMultiCodeRow(allocation)}
                  </li>
                );
              })}
            </ul>

            <div className={classes.alloctionButtons}>
              <TextButton
                onClick={handleAddAllocation}
                className={classes.addAllocationButton}
              >
                {t("Add Allocation")}
              </TextButton>

              <TextButton
                onClick={() => resetAllocation()}
                className={classes.removeSplit}
              >
                {t("Remove Split")}
              </TextButton>
            </div>
          </div>
          {validationMessage && (
            <FormHelperText error={isError}>{validationMessage}</FormHelperText>
          )}
        </>
      )}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {},
  input: {
    cursor: "pointer",
  },
  inputMultiCode: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  multiCodeInputContainer: {
    backgroundColor: theme.background.information,
    border: `1px solid ${theme.customColors.edluminSubText}`,
    borderBottomLeftRadius: theme.spacing(0.5),
    borderBottomRightRadius: theme.spacing(0.5),
  },
  multiCodeList: {
    listStyle: "none",
    margin: 0,
    padding: `${theme.typography.pxToRem(
      theme.spacing(1.5)
    )} ${theme.typography.pxToRem(theme.spacing(1))} ${theme.typography.pxToRem(
      theme.spacing(1)
    )}`,

    "& li": {
      alignItems: "center",
      display: "flex",
      marginBottom: theme.spacing(1),
    },

    "& li:last-child": {
      marginBottom: 0,
    },
  },
  multiCodeSelect: {
    flex: "1 0 auto",
    marginRight: theme.spacing(1),
  },
  multiCodeInput: {
    width: theme.spacing(8),
  },
  multiCodeDeleteButton: {
    paddingLeft: theme.spacing(1),
  },
  alloctionButtons: {
    padding: `0 ${theme.typography.pxToRem(
      theme.spacing(1)
    )} ${theme.typography.pxToRem(theme.spacing(1))} ${theme.typography.pxToRem(
      theme.spacing(1)
    )}`,
  },
  addAllocationButton: {
    color: theme.messages.default,
    marginRight: theme.spacing(1),
  },
  removeSplit: {
    color: theme.status.error,
  },
  error: {
    borderColor: theme.customColors.darkRed,
    borderTopColor: theme.customColors.edluminSubText,
  },
}));

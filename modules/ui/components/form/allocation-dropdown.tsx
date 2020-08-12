import * as React from "react";
import clsx from "clsx";
import memoize from "lodash-es/memoize";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import CancelIcon from "@material-ui/icons/Cancel";
import IconButton from "@material-ui/core/IconButton";
import { SelectNew as Select, OptionType } from "./select-new";
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
  // Allows the parent to render custom elements in the allocation amounts section
  renderAllocationAmount?: (
    props: RenderAllocationAmountArgs
  ) => React.ReactElement;
  // Allows the parent to render custom elements above the multiple allocations section
  renderAllocationsHeaders?: () => React.ReactElement;
};

export type RenderAllocationAmountArgs = {
  disabled: boolean | undefined;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  selection?: OptionType;
  allocationType?: string;
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
  amount?: string;
  allocationType?: string;
};

/*
  Helpers to generate values

  These are helpers to generate valid values that make the type checker happy. The
  value not simple, so these should make it easier.

  Use them to send initial date into the dropdown from data stored on the server
*/

export const NO_ALLOCATION = "no-allocation";
export const SINGLE_ALLOCATION = "single-allocation";
export const MULTIPLE_ALLOCATIONS = "multiple-allocations";

// Used when there is no code selected
export const noAllocation = (): AllocationCodeValue => ({
  type: NO_ALLOCATION,
  selection: undefined,
});

// Used when only a single code is selected
export const singleAllocation = (
  selection?: OptionType
): AllocationCodeValue => ({
  type: SINGLE_ALLOCATION,
  selection,
});

// Used when allocated to multiple codes
export const multipleAllocations = (
  allocations: Allocation[],
  selection?: OptionType
): AllocationCodeValue => ({
  type: MULTIPLE_ALLOCATIONS,
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
    renderAllocationAmount,
    renderAllocationsHeaders,
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

  const renderAllocationRow = memoize((allocation: Allocation) => {
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
          onChange={selection =>
            updateAllocation({
              ...allocation,
              selection,
              allocationType: selection.descriptor,
            })
          }
        />
        {renderAllocationAmount &&
          renderAllocationAmount({
            disabled,
            value: allocation.amount?.toString(),
            allocationType: allocation.allocationType,
            onChange(amount) {
              updateAllocation({ ...allocation, amount });
            },
            selection: allocation.selection,
          })}
        <IconButton
          aria-label="delete"
          role="button"
          className={classes.deleteAllocationButton}
          disableFocusRipple
          size="small"
          onClick={() => removeAllocation(allocation.id)}
          disabled={disabled}
        >
          <CancelIcon />
        </IconButton>
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
            role="table"
            className={clsx({
              [classes.multiCodeInputContainer]: true,
              [classes.error]: isError,
            })}
          >
            <div role="rowgroup" className={classes.allocationsHeader}>
              {renderAllocationsHeaders?.()}
            </div>
            <ul role="rowgroup" className={classes.multiCodeList}>
              {value?.allocations.map(allocation => {
                return (
                  <li role="row" key={allocation.id.toString()}>
                    {renderAllocationRow(allocation)}
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
  allocationsHeader: {
    padding: `${theme.typography.pxToRem(
      theme.spacing(1.5)
    )} ${theme.typography.pxToRem(theme.spacing(1.5))} 0`,
  },
  multiCodeList: {
    listStyle: "none",
    margin: 0,
    padding: ` 0 ${theme.typography.pxToRem(
      theme.spacing(1.5)
    )} ${theme.typography.pxToRem(theme.spacing(1.5))}`,

    "& li": {
      alignItems: "center",
      display: "flex",
      justifyContent: "flex-start",
      marginBottom: theme.spacing(1),
    },

    "& li:last-child": {
      marginBottom: 0,
    },
  },
  multiCodeSelect: {
    flex: "1 0 auto",
    marginRight: theme.spacing(0.5),
  },
  alloctionButtons: {
    padding: `0 ${theme.typography.pxToRem(
      theme.spacing(1.5)
    )} ${theme.typography.pxToRem(
      theme.spacing(1.5)
    )} ${theme.typography.pxToRem(theme.spacing(1.5))}`,
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
  deleteAllocationButton: {
    color: theme.status.error,

    "& svg": {
      height: theme.typography.pxToRem(16),
      width: theme.typography.pxToRem(16),
    },
  },
}));

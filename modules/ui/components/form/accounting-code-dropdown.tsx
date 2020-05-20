import * as React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import { SelectNew as Select, OptionType } from "./select-new";
import { Input } from "./input";
import { TextButton } from "ui/components/text-button";

type AccountingCodeDropdownProps = {
  value?: AccountingCodeValue;
  options: OptionType[];
  onChange: (value: AccountingCodeValue) => void;
};

export type AccountingCodeValue =
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

export const AccountingCodeDropdown = (props: AccountingCodeDropdownProps) => {
  const { value, options, onChange } = props;

  const classes = useStyles();

  const inputClasses = clsx({
    [classes.input]: true,
    [classes.inputMultiCode]: value?.type === "multiple-allocations",
  });

  const handleSelectOnChange = (selection: OptionType) => {
    switch (selection.value) {
      case "multiple-allocations": {
        onChange({
          type: "multiple-allocations",
          selection,
          allocations: [{ id: Math.random() }],
        });
        break;
      }
      case "": {
        resetAllocation();
        break;
      }
      default: {
        onChange({ type: "single-allocation", selection });
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
      allocations: value?.allocations.concat({
        id: Math.random(),
      }),
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

  const mainDropdownOptions = ([
    {
      label: "Multiple allocations",
      value: "multiple-allocations",
    },
  ] as OptionType[]).concat(options);

  const renderMultiCodeRow = (entry: Allocation) => {
    return (
      <>
        <Select
          value={entry.selection}
          className={classes.multiCodeSelect}
          options={options}
          placeholder="Select accounting code"
          multiple={false}
          readOnly
          withResetValue={false}
          onChange={selection =>
            updateAllocation({
              ...entry,
              selection,
            })
          }
        />
        <Input className={classes.multiCodeInput} placeholder="%" />
        <span className={classes.multiCodeDeleteButton}>
          <IconButton
            aria-label="delete"
            disableFocusRipple
            size="small"
            onClick={() => removeAllocation(entry.id)}
          >
            <DeleteIcon />
          </IconButton>
        </span>
      </>
    );
  };

  return (
    <div className={classes.container}>
      <Select
        value={value?.selection}
        label="Accounting code"
        placeholder="Select code"
        options={mainDropdownOptions}
        readOnly={value?.type === "multiple-allocations"}
        doSort={false}
        multiple={false}
        onChange={handleSelectOnChange}
        inputClassName={inputClasses}
      />

      {value?.type === "multiple-allocations" && (
        <>
          <div className={classes.multiCodeInputContainer}>
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
                Add Allocation
              </TextButton>

              <TextButton
                onClick={() => resetAllocation()}
                className={classes.removeSplit}
              >
                Remove Split
              </TextButton>
            </div>
          </div>
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
}));

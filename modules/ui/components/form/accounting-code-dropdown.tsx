import * as React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import { SelectNew as Select, OptionType } from "./select-new";
import { Input } from "./input";
import { TextButton } from "ui/components/text-button";

type AccountingCodeDropdownProps = {
  options: OptionType[];
};

type ViewMode =
  | { type: "choose-code"; selection?: OptionType }
  | {
      type: "multiple-codes";
      selection?: OptionType;
      allocations: Allocation[];
    };

const MULTIPLE_ALLOCATIONS_OPTION_TYPE: OptionType = {
  label: "Multiple allocations",
  value: "multiple-allocations",
};

type Allocation = {
  id: number;
  selection?: OptionType;
  percentage?: number;
};

export const AccountingCodeDropdown = (props: AccountingCodeDropdownProps) => {
  const { options } = props;

  const classes = useStyles();

  const [viewMode, setViewMode] = React.useState<ViewMode>({
    type: "choose-code",
    selection: undefined,
  });

  const inputClasses = clsx({
    [classes.input]: true,
    [classes.inputMultiCode]: viewMode.type === "multiple-codes",
  });

  const handleSelectOnChange = (selection: OptionType) => {
    switch (selection.value) {
      case "multiple-allocations": {
        setViewMode({
          type: "multiple-codes",
          selection,
          allocations: [{ id: Math.random() }],
        });
        break;
      }
      default: {
        setViewMode({ type: "choose-code", selection });
      }
    }
  };

  const resetAllocation = () => {
    setViewMode({ type: "choose-code", selection: undefined });
  };

  const handleAddAllocation = () => {
    if (viewMode.type !== "multiple-codes") {
      return;
    }

    setViewMode({
      ...viewMode,
      allocations: viewMode.allocations.concat({
        id: Math.random(),
      }),
    });
  };

  const removeAllocation = (id: number) => {
    if (viewMode.type !== "multiple-codes") {
      return;
    }

    const updatedAllocations = viewMode.allocations.filter(
      allocation => allocation.id !== id
    );

    if (updatedAllocations.length === 0) {
      return resetAllocation();
    }

    setViewMode({
      ...viewMode,
      allocations: updatedAllocations,
    });
  };

  const updateAllocation = (allocationToUpdate: Allocation) => {
    if (viewMode.type !== "multiple-codes") {
      return;
    }

    const updatedAllocations = viewMode.allocations.map(allocation => {
      if (allocation.id !== allocationToUpdate.id) {
        return allocation;
      }

      return allocationToUpdate;
    });

    setViewMode({
      ...viewMode,
      allocations: updatedAllocations,
    });
  };

  const mainDropdownOptions = ([
    MULTIPLE_ALLOCATIONS_OPTION_TYPE,
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
        value={viewMode.selection}
        label="Accounting code"
        placeholder="Select code"
        options={mainDropdownOptions}
        readOnly={viewMode.type === "multiple-codes"}
        doSort={false}
        multiple={false}
        onChange={handleSelectOnChange}
        inputClassName={inputClasses}
      />

      {viewMode.type === "multiple-codes" && (
        <>
          <div className={classes.multiCodeInputContainer}>
            <ul className={classes.multiCodeList}>
              {viewMode.allocations.map(allocation => {
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

import * as React from "react";
import {
  DataSourceField,
  FilterField,
  ExpressionFunction,
  FilterType,
} from "../../../types";
import {
  Button,
  Popper,
  Fade,
  makeStyles,
  ClickAwayListener,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { OptionalFilterRow } from "./optional-filter-row";

type OptionalFiltersProps = {
  filters: FilterField[];
  filterableFields: DataSourceField[];
  setFilters: (filterFields: FilterField[]) => void;
  refreshReport: () => Promise<void>;
};

type OptionalFiltersFormProps = {
  filters: FilterField[];
  filterableFields: DataSourceField[];
  setFilters: (filterFields: FilterField[]) => void;
  onApply: () => Promise<void>;
  showApply?: boolean;
};

export const OptionalFiltersForm: React.FC<OptionalFiltersFormProps> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { filters, filterableFields, setFilters, onApply, showApply } = props;

  const [localFilters, setLocalFilters] = React.useState<FilterField[]>(
    filters.filter(c =>
      filterableFields
        .map(f => f.dataSourceFieldName)
        .includes(c.field.dataSourceFieldName)
    )
  );

  const filtersWithValue = localFilters.filter(f => f.value !== undefined);

  React.useEffect(() => {
    const definedFilters = localFilters.filter(f => f.value !== undefined);
    setFilters(definedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFilters]);

  const updateFilter = React.useCallback(
    (filterField: FilterField, filterIndex: number) => {
      const updatedFilters = [...localFilters];
      updatedFilters[filterIndex] = filterField;
      setLocalFilters(updatedFilters);
    },
    [localFilters, setLocalFilters]
  );

  const possibleFilters = React.useMemo(() => {
    const remainingFilters = getPossibleFilters(
      [...filters, ...localFilters],
      filterableFields
    );
    return remainingFilters;
  }, [filters, localFilters, filterableFields]);

  const addFilter = React.useCallback(() => {
    setLocalFilters(current => {
      return [
        ...current,
        {
          field: possibleFilters[0],
          expressionFunction: ExpressionFunction.Equal,
          value:
            possibleFilters[0].filterType === FilterType.Boolean
              ? false
              : undefined,
        },
      ];
    });
  }, [setLocalFilters, possibleFilters]);

  const removeFilter = React.useCallback(
    (filterIndex: number) => {
      const updatedFilters = [...localFilters];
      updatedFilters.splice(filterIndex, 1);
      setLocalFilters(updatedFilters);
    },
    [localFilters, setLocalFilters]
  );

  return (
    <div className={classes.filters}>
      {localFilters.length > 0 ? (
        localFilters.map((f, i) => {
          return (
            <OptionalFilterRow
              filterField={f}
              filterableFields={getPossibleFilters(
                [...filters, ...localFilters],
                filterableFields,
                f
              )}
              updateFilter={(filterField: FilterField) =>
                updateFilter(filterField, i)
              }
              removeFilter={() => removeFilter(i)}
              isFirst={i === 0}
              key={i}
            />
          );
        })
      ) : (
        <div className={classes.subText}>{t("No filters applied")}</div>
      )}
      <div className={classes.actions}>
        <Button
          onClick={addFilter}
          variant="text"
          className={classes.addFilter}
          disabled={possibleFilters.length === 0}
        >
          {t("Add filter")}
        </Button>
        {showApply && (
          <Button variant="contained" onClick={onApply}>
            {t("Apply")}
          </Button>
        )}
      </div>
    </div>
  );
};

export const OptionalFilters: React.FC<OptionalFiltersProps> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { filters, filterableFields, setFilters, refreshReport } = props;
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const filtersWithValue = filters.filter(f => f.value !== undefined);
  const [numFiltersWithValue, setNumFiltersWithValue] = React.useState(
    filtersWithValue.length
  );

  const buttonText =
    numFiltersWithValue > 0
      ? `${t("Filtered by:")} ${numFiltersWithValue} ${
          numFiltersWithValue === 1 ? t("field") : t("fields")
        }`
      : t("Filter");

  const handleSetFilters = (filters: FilterField[]) => {
    setFilters(filters);
    setNumFiltersWithValue(filters.filter(f => f.value !== undefined).length);
  };

  const handleApply = async () => {
    setFiltersOpen(false);
    await refreshReport();
  };

  return (
    <>
      <Button
        color="inherit"
        startIcon={<img src={require("ui/icons/reports-filter.svg")} />}
        onClick={() => {
          if (!filtersOpen && numFiltersWithValue === 0) {
            /* The first time you open the optional filters popover, we've already
             *  added an initial filter for the User. For things like dropdowns we
             *  don't acknowledge a filter being set until you select something. For
             *  a boolean (checkbox), the intial unchecked state is implicitly a
             *  selection so we are handling that scenario here.
             */
            const defaultFilter: FilterField = {
              field: filterableFields[0],
              expressionFunction: ExpressionFunction.Equal,
            };
            if (defaultFilter.field.filterType === FilterType.Boolean) {
              defaultFilter.value = 0;
            }

            filters.push(defaultFilter);
          }
          setFiltersOpen(!filtersOpen);
        }}
        className={classes.actionButton}
        ref={buttonRef}
      >
        {buttonText}
      </Button>
      <Popper
        transition
        open={filtersOpen}
        anchorEl={buttonRef.current}
        placement="bottom-start"
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <div>
              <ClickAwayListener
                mouseEvent="onClick"
                onClickAway={async () => {
                  setFiltersOpen(false);
                  await refreshReport();
                }}
              >
                <OptionalFiltersForm
                  {...props}
                  setFilters={handleSetFilters}
                  onApply={handleApply}
                  showApply
                />
              </ClickAwayListener>
            </div>
          </Fade>
        )}
      </Popper>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  actionButton: {
    cursor: "pointer",
    minWidth: theme.typography.pxToRem(150),
    background: "rgba(5, 0, 57, 0.6)",
    borderRadius: "4px",
    padding: `${theme.typography.pxToRem(14)} ${theme.typography.pxToRem(24)}`,
    color: "#FFFFFF",
    "&:hover": {
      background: "rgba(5, 0, 57, 0.5)",
    },
  },
  filters: {
    width: theme.typography.pxToRem(800),
    minHeight: theme.typography.pxToRem(100),
    background: theme.palette.background.paper,
    border: "1px solid #E5E5E5",
    boxSizing: "border-box",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
    borderRadius: "4px",
    padding: theme.spacing(2),
  },
  addFilter: {
    cursor: "pointer",
    marginTop: theme.spacing(2),
    color: theme.customColors.primary,
    fontWeight: 600,
  },
  subText: {
    color: theme.customColors.edluminSubText,
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
}));

const getPossibleFilters = (
  currentFilters: FilterField[],
  allFilterableFields: DataSourceField[],
  includeFilter?: FilterField
) => {
  const currentFiltersFieldNames = currentFilters.map(
    c => c.field.dataSourceFieldName
  );
  const possibleFilters = allFilterableFields.filter(
    f =>
      !currentFiltersFieldNames.includes(f.dataSourceFieldName) ||
      (includeFilter &&
        includeFilter.field.dataSourceFieldName === f.dataSourceFieldName)
  );
  return possibleFilters;
};

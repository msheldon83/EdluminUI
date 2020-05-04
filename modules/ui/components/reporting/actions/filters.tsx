import * as React from "react";
import { DataSourceField, FilterField, ExpressionFunction } from "../types";
import {
  Button,
  Popper,
  Fade,
  makeStyles,
  ClickAwayListener,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { FilterList } from "@material-ui/icons";
import { FilterRow } from "./filter-row";

type Props = {
  currentFilters: FilterField[];
  filterableFields: DataSourceField[];
  setFilters: (filterFields: FilterField[]) => void;
  refreshReport: () => Promise<void>;
};

export const Filters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { currentFilters, filterableFields, setFilters } = props;
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [localFilters, setLocalFilters] = React.useState<FilterField[]>(
    currentFilters && currentFilters.length > 0
      ? currentFilters
      : [
          {
            field: filterableFields[0],
            expressionFunction: ExpressionFunction.Equal,
          },
        ]
  );

  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const buttonText =
    currentFilters.length > 0
      ? `${t("Filtered by:")} ${currentFilters.length} ${
          currentFilters.length === 1 ? t("field") : t("fields")
        }`
      : t("Filter");

  React.useEffect(() => {
    const definedFilters = localFilters.filter(f => !!f.value);
    setFilters(definedFilters);
  }, [localFilters]);

  const updateFilter = React.useCallback(
    (filterField: FilterField, filterIndex: number) => {
      const updatedFilters = [...localFilters];
      updatedFilters[filterIndex] = filterField;
      setLocalFilters(updatedFilters);
    },
    [localFilters, setLocalFilters]
  );

  const addFilter = React.useCallback(() => {
    setLocalFilters(current => {
      return [
        ...current,
        {
          field: filterableFields[0],
          expressionFunction: ExpressionFunction.Equal,
        },
      ];
    });
  }, [setLocalFilters, setLocalFilters, filterableFields]);

  const removeFilter = React.useCallback(
    (filterIndex: number) => {
      const updatedFilters = [...localFilters];
      updatedFilters.splice(filterIndex, 1);
      setLocalFilters(updatedFilters);
    },
    [localFilters, setLocalFilters]
  );

  return (
    <>
      <Button
        color="inherit"
        startIcon={<FilterList />}
        onClick={() => setFiltersOpen(!filtersOpen)}
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
            <ClickAwayListener
              mouseEvent="onMouseDown"
              onClickAway={() => {
                setFiltersOpen(false);
                // TODO: trigger refreshReport
              }}
            >
              <div className={classes.filters}>
                {localFilters.length > 0 ? (
                  localFilters.map((f, i) => {
                    return (
                      <FilterRow
                        filterField={f}
                        filterableFields={filterableFields}
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
                  <div className={classes.subText}>
                    {t("No filters applied")}
                  </div>
                )}
                <div className={classes.addFilter} onClick={addFilter}>
                  {t("Add filter")}
                </div>
              </div>
            </ClickAwayListener>
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
    width: theme.typography.pxToRem(600),
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
}));

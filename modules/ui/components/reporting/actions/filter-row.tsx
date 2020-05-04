import * as React from "react";
import {
  DataSourceField,
  FilterType,
  FilterField,
  ExpressionFunction,
} from "../types";
import { Checkbox, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { SelectNew } from "ui/components/form/select-new";
import { PositionTypeSelect } from "ui/components/reference-selects/position-type-select";
import { LocationSelect } from "ui/components/reference-selects/location-select";
import { Close } from "@material-ui/icons";
import { useOrganizationId } from "core/org-context";

type Props = {
  filterField: FilterField;
  filterableFields: DataSourceField[];
  updateFilter: (filterField: FilterField) => void;
  removeFilter: () => void;
  isFirst?: boolean;
};

export const FilterRow: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const organizationId = useOrganizationId();
  const {
    filterField,
    filterableFields,
    updateFilter,
    removeFilter,
    isFirst = false,
  } = props;

  const filterOptions = React.useMemo(() => {
    return filterableFields.map(f => {
      if (!f.filterTypeDefinition) {
        return {
          label: f.friendlyName,
          value: f.dataSourceFieldName,
        };
      }

      return {
        label: f.filterTypeDefinition.friendlyName,
        value: f.filterTypeDefinition.filterDataSourceFieldName,
      };
    });
  }, [filterableFields]);

  console.log(filterField);

  const filter: JSX.Element | null = React.useMemo(() => {
    switch (filterField.field.filterType) {
      case FilterType.Boolean:
        return (
          <Checkbox
            checked={filterField.value ?? false}
            onChange={(e, checked) =>
              updateFilter({
                field: filterField.field,
                expressionFunction: ExpressionFunction.Equal,
                value: checked,
              })
            }
            color="primary"
          />
        );
      case FilterType.Custom:
        switch (filterField.field.filterTypeDefinition?.key) {
          case "Location":
            return (
              <LocationSelect
                orgId={organizationId ?? undefined}
                setSelectedLocationIds={locationIds => {
                  console.log(locationIds);

                  const value = locationIds ?? [];
                  updateFilter({
                    field: filterField.field,
                    expressionFunction:
                      value.length > 0
                        ? ExpressionFunction.ContainedIn
                        : ExpressionFunction.Equal,
                    value: value,
                  });
                }}
                selectedLocationIds={filterField.value ?? []}
                multiple={
                  filterField.expressionFunction ===
                  ExpressionFunction.ContainedIn
                }
                includeAllOption={false}
                key={filterField.expressionFunction}
              />
            );
          case "PositionType":
            return (
              <PositionTypeSelect
                orgId={organizationId ?? undefined}
                setSelectedPositionTypeIds={positionTypeIds => {
                  const value = positionTypeIds ?? [];
                  updateFilter({
                    field: filterField.field,
                    expressionFunction:
                      value.length > 0
                        ? ExpressionFunction.ContainedIn
                        : ExpressionFunction.Equal,
                    value: value,
                  });
                }}
                selectedPositionTypeIds={filterField.value ?? []}
                multiple={
                  filterField.expressionFunction ===
                  ExpressionFunction.ContainedIn
                }
                includeAllOption={false}
                key={filterField.expressionFunction}
              />
            );
        }
        break;
    }

    return null;
  }, [filterField]);

  const expressionOptions = React.useMemo(() => {
    switch (filterField.field.filterType) {
      case FilterType.Boolean:
        return [
          {
            label: t("is"),
            value: ExpressionFunction.Equal,
          },
        ];
      case FilterType.Custom:
        return [
          {
            label: t("is"),
            value: ExpressionFunction.Equal,
          },
          {
            label: t("is any of"),
            value: ExpressionFunction.ContainedIn,
          },
        ];
    }

    return [];
  }, [filterField]);

  return (
    <div className={classes.row}>
      <div className={classes.logicalOperator}>
        <div className={classes.removeRow}>
          <Close className={classes.removeRowIcon} onClick={removeFilter} />
        </div>
        <div>{isFirst ? t("Where") : t("And")}</div>
      </div>
      <div className={`${classes.filterField} ${classes.rowItem}`}>
        <SelectNew
          value={
            filterOptions.find(
              fo => fo.value === filterField.field.dataSourceFieldName
            ) ?? filterOptions[0]
          }
          options={filterOptions}
          onChange={v =>
            updateFilter({
              field:
                filterableFields.find(f => f.dataSourceFieldName === v.value) ??
                filterField.field,
              expressionFunction: ExpressionFunction.Equal,
            })
          }
          multiple={false}
          withResetValue={false}
        />
      </div>
      <div className={`${classes.expression} ${classes.rowItem}`}>
        {expressionOptions.length === 1 ? (
          expressionOptions[0].label
        ) : (
          <SelectNew
            value={
              expressionOptions.find(
                eo => eo.value === filterField.expressionFunction
              ) ?? expressionOptions[0]
            }
            options={expressionOptions}
            onChange={v =>
              updateFilter({
                field: filterField.field,
                expressionFunction: v.value as ExpressionFunction,
              })
            }
            multiple={false}
            withResetValue={false}
          />
        )}
      </div>
      <div className={`${classes.filter} ${classes.rowItem}`}>{filter}</div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowItem: {
    marginLeft: theme.spacing(),
  },
  logicalOperator: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    fontWeight: 600,
  },
  removeRow: {
    color: theme.customColors.primary,
    cursor: "pointer",
    width: theme.typography.pxToRem(30),
  },
  removeRowIcon: {
    width: theme.typography.pxToRem(20),
  },
  filterField: {
    width: theme.typography.pxToRem(200),
  },
  expression: {
    width: theme.typography.pxToRem(100),
  },
  filter: {
    width: theme.typography.pxToRem(100),
  },
}));

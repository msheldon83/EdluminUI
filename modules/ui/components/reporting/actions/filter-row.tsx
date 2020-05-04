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
import { TFunction } from "i18next";

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
  const [expressionOptions, setExpressionOptions] = React.useState(
    getExpressionOptions(t, filterField.field)
  );

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
        value: f.dataSourceFieldName,
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
          case "Employee":
            //TODO
            break;
          case "Substitute":
            //TODO
            break;
          case "AbsenceReason":
            //TODO
            break;
          case "VacancyReason":
            //TODO
            break;
        }
        break;
    }

    return null;
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
          value={filterOptions.find(
            fo => fo.value === filterField.field.dataSourceFieldName
          )}
          options={filterOptions}
          onChange={v => {
            const dataSourceField = filterableFields.find(
              f => f.dataSourceFieldName === v.value
            );
            if (dataSourceField) {
              setExpressionOptions(getExpressionOptions(t, dataSourceField));
              updateFilter({
                field: dataSourceField,
                expressionFunction: ExpressionFunction.Equal,
                value:
                  dataSourceField.filterType === FilterType.Boolean
                    ? false
                    : undefined,
              });
            }
          }}
          multiple={false}
          withResetValue={false}
          doSort={false}
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
            doSort={false}
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
    marginTop: theme.spacing(),
  },
  rowItem: {
    marginLeft: theme.spacing(),
  },
  logicalOperator: {
    display: "flex",
    alignItems: "center",
    fontWeight: 600,
    width: theme.typography.pxToRem(75),
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
    width: theme.typography.pxToRem(175),
  },
  expression: {
    width: theme.typography.pxToRem(110),
  },
  filter: {
    width: theme.typography.pxToRem(300),
  },
}));

const getExpressionOptions = (t: TFunction, field?: DataSourceField) => {
  if (!field) {
    return [
      {
        label: t("is"),
        value: ExpressionFunction.Equal,
      },
    ];
  }

  switch (field.filterType) {
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
};

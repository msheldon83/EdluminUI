import * as React from "react";
import {
  DataSourceField,
  FilterType,
  FilterField,
  ExpressionFunction,
} from "../../types";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { SelectNew } from "ui/components/form/select-new";
import { Close } from "@material-ui/icons";
import { TFunction } from "i18next";
import { Filter } from "./filter";

type Props = {
  filterField: FilterField;
  filterableFields: DataSourceField[];
  updateFilter: (filterField: FilterField) => void;
  removeFilter: () => void;
  isFirst?: boolean;
};

export const OptionalFilterRow: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
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
                value: filterField.value ?? undefined,
              })
            }
            multiple={false}
            withResetValue={false}
            doSort={false}
          />
        )}
      </div>
      <div className={`${classes.filter} ${classes.rowItem}`}>
        <Filter filterField={filterField} updateFilter={updateFilter} />
      </div>
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
  const possibleOptions = [
    {
      label: t("is"),
      value: ExpressionFunction.Equal,
    },
    {
      label: t("is not"),
      value: ExpressionFunction.NotEqual,
    },
    {
      label: t("is any of"),
      value: ExpressionFunction.ContainedIn,
    },
    {
      label: "<",
      value: ExpressionFunction.LessThan,
    },
    {
      label: "<=",
      value: ExpressionFunction.LessThanOrEqual,
    },
    {
      label: ">",
      value: ExpressionFunction.GreaterThan,
    },
    {
      label: ">=",
      value: ExpressionFunction.GreaterThanOrEqual,
    },
  ];

  if (!field) {
    return possibleOptions.filter(o => o.value === ExpressionFunction.Equal);
  }

  switch (field.filterType) {
    case FilterType.Boolean:
      return possibleOptions.filter(o => o.value === ExpressionFunction.Equal);
    case FilterType.PredefinedSelection:
      return possibleOptions.filter(
        o =>
          o.value === ExpressionFunction.Equal ||
          o.value === ExpressionFunction.ContainedIn
      );
    case FilterType.Number:
    case FilterType.Decimal:
      return possibleOptions.filter(
        o =>
          o.value === ExpressionFunction.Equal ||
          o.value === ExpressionFunction.NotEqual ||
          o.value === ExpressionFunction.LessThan ||
          o.value === ExpressionFunction.LessThanOrEqual ||
          o.value === ExpressionFunction.GreaterThan ||
          o.value === ExpressionFunction.GreaterThanOrEqual
      );
    case FilterType.Custom:
      return possibleOptions.filter(o =>
        field.filterTypeDefinition?.supportedExpressions?.includes(o.value)
      );
  }

  return [];
};

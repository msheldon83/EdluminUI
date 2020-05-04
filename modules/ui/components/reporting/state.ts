import { Reducer } from "react";
import {
  OrderByField,
  ReportDefinition,
  DataSourceField,
  ReportDefinitionInput,
  FilterField,
  ExpressionFunction,
  Direction,
} from "./types";
import { compact } from "lodash-es";
import { format } from "date-fns";

export type ReportState = {
  reportDefinitionInput: ReportDefinitionInput;
  reportDefinition?: ReportDefinition;
  filters: {
    optional: FilterField[];
    required: FilterField[];
  };
  filterableFields: DataSourceField[];
  orderBy?: OrderByField;
  rdlString: string;
};

export type ReportActions =
  | {
      action: "setReportDefinition";
      reportDefinition: ReportDefinition;
      filterFieldsOverride?: string[];
    }
  | {
      action: "setOptionalFilters";
      filters: FilterField[];
      refreshReport?: boolean;
    }
  | {
      action: "setRequiredFilters";
      filters: FilterField[];
      refreshReport?: boolean;
    }
  | {
      action: "setOrderBy";
      field: OrderByField;
    }
  | {
      action: "refreshReport";
    };

export const reportReducer: Reducer<ReportState, ReportActions> = (
  prev,
  action
) => {
  switch (action.action) {
    case "setReportDefinition": {
      const allFields = action.reportDefinition.metadata.query.schema.allFields;
      let filterableFields = allFields.filter(f => !!f.filterType);
      // If we have filterFieldsOverride, then filter the list down to the matching ones
      if (
        !!action.filterFieldsOverride &&
        action.filterFieldsOverride.length > 0
      ) {
        filterableFields = filterableFields.filter(f =>
          action.filterFieldsOverride?.includes(f.dataSourceFieldName)
        );
      }

      //TODO: Process the current filters from the Report Definition and put them
      // into the currentFilters array

      return {
        ...prev,
        reportDefinition: action.reportDefinition,
        filterableFields: filterableFields,
      };
    }
    case "setOptionalFilters": {
      const updatedFilters = {
        ...prev.filters,
        optional: [...action.filters],
      };
      const updatedState = {
        ...prev,
        filters: updatedFilters,
        reportDefinitionInput: {
          ...prev.reportDefinitionInput,
          filter: convertFiltersToStrings([
            ...updatedFilters.required,
            ...updatedFilters.optional,
          ]),
        },
      };
      if (action.refreshReport) {
        updatedState.rdlString = convertReportDefinitionInputToRdl(
          updatedState.reportDefinitionInput
        );
      }
      return updatedState;
    }
    case "setRequiredFilters": {
      const updatedFilters = {
        ...prev.filters,
        required: [...action.filters],
      };
      const updatedState = {
        ...prev,
        filters: updatedFilters,
        reportDefinitionInput: {
          ...prev.reportDefinitionInput,
          filter: convertFiltersToStrings([
            ...updatedFilters.required,
            ...updatedFilters.optional,
          ]),
        },
      };
      if (action.refreshReport) {
        updatedState.rdlString = convertReportDefinitionInputToRdl(
          updatedState.reportDefinitionInput
        );
      }
      return updatedState;
    }
    case "setOrderBy": {
      return {
        ...prev,
        orderBy: action.field,
        reportDefinitionInput: {
          ...prev.reportDefinitionInput,
          orderBy: [
            {
              expression: action.field.expression.displayName,
              direction: action.field.direction,
            },
          ],
        },
      };
    }
    case "refreshReport": {
      return {
        ...prev,
        rdlString: convertReportDefinitionInputToRdl(
          prev.reportDefinitionInput
        ),
      };
    }
  }
};

const convertFiltersToStrings = (filterFields: FilterField[]): string[] => {
  if (filterFields.length === 0) {
    return [];
  }

  const filters = compact(
    filterFields.map(f => {
      const dataSourceFieldName = f.field.filterTypeDefinition
        ? f.field.filterTypeDefinition.filterDataSourceFieldName
        : f.field.dataSourceFieldName;
      switch (f.expressionFunction) {
        case ExpressionFunction.Equal:
          const equalValue = processFilterValue(f.value);
          return `(${dataSourceFieldName} = ${
            Array.isArray(equalValue) ? equalValue[0] : equalValue
          })`;
        case ExpressionFunction.ContainedIn:
          const inValue = processFilterValue(f.value);
          return `(${dataSourceFieldName} IN (${
            Array.isArray(inValue) ? inValue.join(",") : inValue
          }))`;
      }
    })
  );
  return filters;
};

const processFilterValue = (value: any): any => {
  if (Array.isArray(value)) {
    return [...value.map(v => processFilterValue(v))];
  }
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }
  if (value instanceof Date) {
    return `'${format(value, "MM/dd/yyyy")}'`;
  }
  return value;
};

export const convertReportDefinitionInputToRdl = (
  input: ReportDefinitionInput
): string => {
  const rdlPieces: string[] = [];
  rdlPieces.push(`QUERY FROM ${input.from}`);
  if (input.filter && input.filter.length > 0) {
    rdlPieces.push(`WHERE ${input.filter.join(" AND ")}`);
  }
  rdlPieces.push(`SELECT ${input.select.join(", ")}`);
  if (input.orderBy && input.orderBy.length > 0) {
    rdlPieces.push(
      `ORDER BY ${input.orderBy
        .map(
          o =>
            `${o.expression} ${o.direction === Direction.Asc ? "ASC" : "DESC"}`
        )
        .join(", ")}`
    );
  }
  const rdlString = rdlPieces.join(" ");
  return rdlString;
};

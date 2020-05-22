import { Reducer } from "react";
import {
  OrderByField,
  ReportDefinition,
  ReportChartDefinition,
  DataSourceField,
  ReportDefinitionInput,
  FilterField,
  ExpressionFunction,
  Direction,
} from "./types";
import { compact } from "lodash-es";
import { format, startOfDay, endOfDay } from "date-fns";
import { getGraphTypeString } from "./helpers";

export type ReportState = {
  reportDefinitionInput: ReportDefinitionInput;
  reportDefinition?: ReportDefinition;
  reportChartDefinition?: ReportChartDefinition;
  filters: {
    optional: FilterField[];
    required: FilterField[];
  };
  filterableFields: DataSourceField[];
  orderBy?: OrderByField;
  rdlString: string;
  rdlChartString: string | null;
};

export type ReportActions =
  | {
      action: "setReportDefinition";
      reportDefinition: ReportDefinition;
      filterFieldsOverride?: string[];
    }
  | {
      action: "setReportChartDefinition";
      reportChartDefinition: ReportChartDefinition;
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
        filterableFields = [];
        // Maintain the ordering of the filterFieldsOverride list
        action.filterFieldsOverride.forEach(ff => {
          const matchingField = allFields.find(
            m => m.dataSourceFieldName === ff
          );
          if (matchingField) {
            filterableFields.push(matchingField);
          }
        });
      }

      //TODO: Process the current filters from the Report Definition and put them
      // into the currentFilters array

      // If setting the report definition for the first time, carry any defined
      // filters from the ReportDefinitionInput into the matching filters list
      if (!prev.reportDefinition && prev.reportDefinitionInput.filter) {
        const updatedFilters: {
          optional: FilterField[];
          required: FilterField[];
        } = {
          optional: [],
          required: [],
        };
        const fields = action.reportDefinition.metadata.query.schema.allFields;
        prev.reportDefinitionInput.filter.forEach(filter => {
          const matchingField = fields.find(
            field => field.dataSourceFieldName === filter.fieldName
          );
          if (matchingField) {
            if (matchingField.isRequiredFilter || filter.isRequired) {
              updatedFilters.required.push({
                field: matchingField,
                expressionFunction: filter.expressionFunction,
                value: filter.value,
              });
            } else {
              updatedFilters.optional.push({
                field: matchingField,
                expressionFunction: filter.expressionFunction,
                value: filter.value,
              });
            }
          }
        });

        return {
          ...prev,
          reportDefinition: action.reportDefinition,
          filterableFields: filterableFields,
          filters: updatedFilters,
        };
      }

      return {
        ...prev,
        reportDefinition: action.reportDefinition,
        filterableFields: filterableFields,
      };
    }
    case "setReportChartDefinition": {
      return {
        ...prev,
        reportChartDefinition: action.reportChartDefinition,
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
          filter: getFiltersForReportDefinitionInput(
            updatedFilters.required,
            updatedFilters.optional
          ),
        },
      };
      if (action.refreshReport) {
        updatedState.rdlString = convertReportDefinitionInputToRdl(
          updatedState.reportDefinitionInput
        );
        updatedState.rdlChartString = convertReportDefinitionInputToRdlForChart(
          updatedState.reportDefinitionInput
        );
      }
      return updatedState;
    }
    case "setRequiredFilters": {
      const filtersNotIncludedInTheIncomingList = prev.filters.required.filter(
        f =>
          !action.filters.find(
            a => f.field.dataSourceFieldName === a.field.dataSourceFieldName
          )
      );

      const updatedFilters = {
        ...prev.filters,
        required: [...action.filters, ...filtersNotIncludedInTheIncomingList],
      };

      const updatedState = {
        ...prev,
        filters: updatedFilters,
        reportDefinitionInput: {
          ...prev.reportDefinitionInput,
          filter: getFiltersForReportDefinitionInput(
            updatedFilters.required,
            updatedFilters.optional
          ),
        },
      };
      if (action.refreshReport) {
        updatedState.rdlString = convertReportDefinitionInputToRdl(
          updatedState.reportDefinitionInput
        );
        updatedState.rdlChartString = convertReportDefinitionInputToRdlForChart(
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
        rdlChartString: convertReportDefinitionInputToRdlForChart(
          prev.reportDefinitionInput
        ),
      };
    }
  }
};

const getFiltersForReportDefinitionInput = (
  requiredFilters: FilterField[],
  optionalFilters: FilterField[]
): ReportDefinitionInput["filter"] => {
  return [
    ...requiredFilters.map(f => {
      return {
        fieldName: getFilterFieldName(f),
        expressionFunction: f.expressionFunction,
        value: f.value,
        isRequired: true,
      };
    }),
    ...optionalFilters.map(f => {
      return {
        fieldName: getFilterFieldName(f),
        expressionFunction: f.expressionFunction,
        value: f.value,
      };
    }),
  ];
};

const getFilterFieldName = (filterField: FilterField): string => {
  const dataSourceFieldName = filterField.field.filterTypeDefinition
    ? filterField.field.filterTypeDefinition.filterDataSourceFieldName
    : filterField.field.dataSourceFieldName;
  return dataSourceFieldName;
};

const buildFormula = (
  fieldName: string,
  expressionFunction: ExpressionFunction,
  value: any
): string | null => {
  switch (expressionFunction) {
    case ExpressionFunction.Equal: {
      const equalValue = processFilterValue(value);
      return `(${fieldName} = ${
        Array.isArray(equalValue) ? `'${equalValue[0]}'` : `'${equalValue}'`
      })`;
    }
    case ExpressionFunction.NotEqual: {
      const notEqualValue = processFilterValue(value);
      return `(${fieldName} != ${
        Array.isArray(notEqualValue)
          ? `'${notEqualValue[0]}'`
          : `'${notEqualValue}'`
      })`;
    }
    case ExpressionFunction.ContainedIn: {
      const inValue = processFilterValue(value);
      return `(${fieldName} IN (${
        Array.isArray(inValue) ? `'${inValue.join("','")}'` : `'${inValue}'`
      }))`;
    }
    case ExpressionFunction.Between: {
      let betweenValues: any[] = [];
      if (
        Array.isArray(value) &&
        value[0] instanceof Date &&
        value[1] instanceof Date
      ) {
        // Handle date range between
        betweenValues = [
          `'${format(startOfDay(value[0]), "MM/dd/yyyy H:mm:ss")}'`,
          `'${format(endOfDay(value[1]), "MM/dd/yyyy H:mm:ss")}'`,
        ];
      } else {
        betweenValues = processFilterValue(value);
      }
      return `(${fieldName} BETWEEN ${betweenValues[0]} AND ${betweenValues[1]})`;
    }
  }
  return null;
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
  input: ReportDefinitionInput,
  forExport?: boolean
): string => {
  const rdlPieces: string[] = [];
  rdlPieces.push(...getRdlFromAndWhere(input));

  const selects = [...input.select];
  if (forExport && input.subtotalBy && input.subtotalBy.length > 0) {
    // When exporting a grouped report, we need to make sure
    // the things we are gouping by are represented in the data
    // that is going to be put into the file
    for (let i = input.subtotalBy.length - 1; i >= 0; i--) {
      const subtotalBy = input.subtotalBy[i];
      if (
        subtotalBy.showExpression &&
        !selects.map(s => s.expression).includes(subtotalBy.showExpression)
      ) {
        selects.unshift({ expression: subtotalBy.showExpression });
      }
      if (
        !subtotalBy.showExpression &&
        !selects.map(s => s.expression).includes(subtotalBy.expression)
      ) {
        selects.unshift({ expression: subtotalBy.expression });
      }
    }
  }

  rdlPieces.push(`SELECT ${selects.map(s => s.expression).join(", ")}`);

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

  if (input.subtotalBy && input.subtotalBy.length > 0) {
    rdlPieces.push(
      `WITH SUBTOTALS ${input.subtotalBy
        .map(
          s =>
            `${s.expression} ${
              s.showExpression ? `SHOW ${s.showExpression}` : ""
            }`
        )
        .join(", ")}`
    );
  }

  const rdlString = rdlPieces.join(" ");
  return rdlString;
};

const getRdlFromAndWhere = (input: ReportDefinitionInput) => {
  const rdlPieces: string[] = [];
  rdlPieces.push(`QUERY FROM ${input.from}`);

  if (input.filter && input.filter.length > 0) {
    const filterStrings = compact(
      input.filter.map(f =>
        buildFormula(f.fieldName, f.expressionFunction, f.value)
      )
    );
    rdlPieces.push(`WHERE ${filterStrings.join(" AND ")}`);
  }
  return rdlPieces;
};

const getRdlChart = (input: ReportDefinitionInput) => {
  const rdlPieces: string[] = [];
  if (!input.chart) {
    return rdlPieces;
  }

  rdlPieces.push("CHART");

  rdlPieces.push(
    input.chart.graphs
      .map(g => {
        return `${getGraphTypeString(g.type)} [${g.series
          .map(s => s)
          .join(", ")}]${g.byExpression ? ` BY ${g.byExpression}` : ""}`;
      })
      .join(", ")
  );

  rdlPieces.push(`AGAINST ${input.chart.againstExpression}`);
  return rdlPieces;
};

export const convertReportDefinitionInputToRdlForChart = (
  input: ReportDefinitionInput
): string | null => {
  if (!input.chart) {
    return null;
  }

  const rdlPieces: string[] = [];
  rdlPieces.push(...getRdlFromAndWhere(input));
  rdlPieces.push(...getRdlChart(input));

  const rdlString = rdlPieces.join(" ");
  return rdlString;
};

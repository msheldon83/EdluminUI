import { Reducer } from "react";
import {
  ReportDefinition,
  ReportChartDefinition,
  DataSourceField,
  FilterField,
  ExpressionFunction,
  Direction,
  Report,
  LogicalTerm,
  Formula,
  DataExpression,
  FilterType,
  OrderByField,
} from "./types";
import { compact, flatMap } from "lodash-es";
import { format, parseISO } from "date-fns";
import { getGraphTypeString, filtersAreDifferent } from "./helpers";

export type ReportState = {
  rdlString: string;
  rdlChartString?: string | null | undefined;
  report?: Report;
  reportDefinition?: ReportDefinition;
  reportChartDefinition?: ReportChartDefinition;
  filterableFields: DataSourceField[];
  baseFilterFieldNames?: string[];
};

export type ReportActions =
  | {
      action: "processReportDefinition";
      reportDefinition: ReportDefinition;
      allowedFilterFieldsOverride?: string[];
    }
  | {
      action: "setReportChartDefinition";
      reportChartDefinition: ReportChartDefinition;
    }
  | {
      action: "setFilters";
      filters: FilterField[];
      areRequiredFilters: boolean;
      refreshReport?: boolean;
    }
  | {
      action: "setOrderBy";
      orderBy: OrderByField[];
    }
  | {
      action: "setFirstLevelOrderBy";
      expression: DataExpression;
      direction: Direction;
    }
  | {
      action: "addColumns";
      columns: DataExpression[];
      index?: number;
      addBeforeIndex?: boolean;
    }
  | {
      action: "setColumns";
      columns: DataExpression[];
    }
  | {
      action: "removeColumn";
      index: number;
    }
  | {
      action: "refreshReport";
    };

export const reportReducer: Reducer<ReportState, ReportActions> = (
  prev,
  action
) => {
  switch (action.action) {
    case "processReportDefinition": {
      const allFields = action.reportDefinition.metadata.query.schema.allFields;
      const queryMetadata = action.reportDefinition.metadata.query;
      const chartMetadata = action.reportDefinition.metadata.chart;

      if (!prev.report) {
        // Build out the Report based on the report definition from the server
        const report: Report = {
          from: queryMetadata.schema.name,
          selects: queryMetadata.selects,
          filters: queryMetadata.filters
            ? buildFilters(queryMetadata.filters)
            : [],
          orderBy: queryMetadata.orderBy,
          subtotalBy: queryMetadata.subtotalBy,
          numberOfLockedColumns:
            action.reportDefinition.metadata.numberOfLockedColumns ?? 0,
          chart: chartMetadata
            ? {
                againstExpression:
                  chartMetadata.against.expressionAsQueryLanguage,
                graphs: chartMetadata.graphs.map(g => {
                  return {
                    type: g.type,
                    series: g.series,
                    byExpression: g.by?.expressionAsQueryLanguage,
                  };
                }),
              }
            : undefined,
        };

        // Figure out which fields are filterable
        let filterableFields = allFields.filter(f => !!f.filterType);
        // If we have filterFieldsOverride, then filter the list down to the matching ones
        if (
          !!action.allowedFilterFieldsOverride &&
          action.allowedFilterFieldsOverride.length > 0
        ) {
          filterableFields = [];
          // Maintain the ordering of the filterFieldsOverride list
          action.allowedFilterFieldsOverride.forEach(ff => {
            const matchingField = allFields.find(
              m => m.dataSourceFieldName === ff
            );
            if (matchingField) {
              filterableFields.push(matchingField);
            }
          });
        }

        // If we have any base filters defined, remove them from the list of filterableFields
        // since they are defined when we need to form a specific foundation for a Report
        filterableFields = filterableFields.filter(
          f => !prev.baseFilterFieldNames?.includes(f.dataSourceFieldName)
        );

        return {
          ...prev,
          report: report,
          reportDefinition: action.reportDefinition,
          filterableFields: filterableFields,
          rdlChartString: report.chart
            ? convertReportDefinitionInputToRdlForChart(report)
            : undefined,
        };
      }

      return {
        ...prev,
        reportDefinition: action.reportDefinition,
      };
    }
    case "setReportChartDefinition": {
      return {
        ...prev,
        reportChartDefinition: action.reportChartDefinition,
      };
    }
    case "setFilters": {
      let requiredFilters =
        prev.report?.filters?.filter(f => f.field.isRequiredFilter) ?? [];
      let optionalFilters =
        prev.report?.filters?.filter(f => !f.field.isRequiredFilter) ?? [];

      if (action.areRequiredFilters) {
        requiredFilters = action.filters;
      } else {
        optionalFilters = action.filters;
      }

      // Make sure we don't lose any base filters for the Report
      // that may have been defined
      const resolvedBaseFilters =
        prev.report?.filters?.filter(
          f =>
            prev.baseFilterFieldNames?.includes(f.field.dataSourceFieldName) &&
            ![...requiredFilters, ...optionalFilters].find(
              cf => cf.field.dataSourceFieldName === f.field.dataSourceFieldName
            )
        ) ?? [];

      const updatedFilters = [
        ...resolvedBaseFilters,
        ...requiredFilters,
        ...optionalFilters,
      ];

      // Determine if the filters have actually changed and warrant an update
      const filtersHaveChanged = filtersAreDifferent(
        prev.report!.filters ?? [],
        updatedFilters
      );
      if (!filtersHaveChanged) {
        // No changes to the filters, don't update anything
        return prev;
      }

      const updatedState = {
        ...prev,
        report: {
          ...prev.report!,
          filters: updatedFilters,
        },
      };

      if (action.refreshReport) {
        updatedState.rdlString = convertReportDefinitionInputToRdl(
          updatedState.report
        );
        if (prev.rdlChartString) {
          updatedState.rdlChartString = convertReportDefinitionInputToRdlForChart(
            updatedState.report
          );
        }
      }
      return updatedState;
    }
    case "setOrderBy": {
      return {
        ...prev,
        report: {
          ...prev.report!,
          orderBy: action.orderBy,
        },
      };
    }
    case "setFirstLevelOrderBy": {
      // Get our current order bys minus the one we want at the top of the list
      const updatedOrderBy = [
        ...(prev.report!.orderBy?.filter(
          f =>
            f.expression.baseExpressionAsQueryLanguage !==
            action.expression.baseExpressionAsQueryLanguage
        ) ?? []),
      ];
      // Add the current expression as the top level sort
      updatedOrderBy.unshift({
        expression: action.expression,
        direction: action.direction,
      });

      const updatedState = {
        ...prev,
        report: {
          ...prev.report!,
          orderBy: updatedOrderBy,
        },
      };
      updatedState.rdlString = convertReportDefinitionInputToRdl(
        updatedState.report
      );
      return updatedState;
    }
    case "addColumns": {
      let updatedSelects = [...prev.report!.selects];
      if (action.index) {
        // If we're adding columns before or after another column
        const beforeSelects = updatedSelects.slice(
          0,
          action.addBeforeIndex ? action.index : action.index + 1
        );
        const afterSelects = updatedSelects.slice(
          action.addBeforeIndex ? action.index : action.index + 1
        );
        updatedSelects = [...beforeSelects, ...action.columns, ...afterSelects];
      } else {
        updatedSelects = [...prev.report!.selects, ...action.columns];
      }

      const updatedState = {
        ...prev,
        report: {
          ...prev.report!,
          selects: updatedSelects,
        },
      };

      updatedState.rdlString = convertReportDefinitionInputToRdl(
        updatedState.report
      );
      return updatedState;
    }
    case "setColumns": {
      const updatedState = {
        ...prev,
        report: {
          ...prev.report!,
          selects: action.columns,
        },
      };

      updatedState.rdlString = convertReportDefinitionInputToRdl(
        updatedState.report
      );
      return updatedState;
    }
    case "removeColumn": {
      const updatedSelects = [...prev.report!.selects];
      const removedField = updatedSelects.splice(action.index, 1);

      const updatedOrderBy = [...(prev.report!.orderBy ?? [])];
      // Determine if we're removing a field that is currently being sorted on
      // If so, then we need to remove that from the Order By list
      const orderByMatch = updatedOrderBy.find(
        o =>
          o.expression.baseExpressionAsQueryLanguage ===
          removedField[0]?.baseExpressionAsQueryLanguage
      );
      if (orderByMatch) {
        const orderByIndexToRemove = updatedOrderBy.indexOf(orderByMatch);
        updatedOrderBy.splice(orderByIndexToRemove, 1);
      }

      const updatedState = {
        ...prev,
        report: {
          ...prev.report!,
          selects: updatedSelects,
          orderBy: updatedOrderBy,
        },
      };

      updatedState.rdlString = convertReportDefinitionInputToRdl(
        updatedState.report
      );
      return updatedState;
    }
    case "refreshReport": {
      return {
        ...prev,
        rdlString: convertReportDefinitionInputToRdl(prev.report!),
        rdlChartString: convertReportDefinitionInputToRdlForChart(prev.report!),
      };
    }
  }
};

// There's some recursion as to how the Filter on the server is defined
// so we need to handle when the condition is a LogicalTerm, following
// that list of conditions down until we have a Formula and can build
// out a proper FilterField for our components to work with.
// The definition on the backed of a LogicalTerm has an Operator property
// to support AND or OR conditions. For now we are only allowing the User
// to create AND conditions so we're assuming AND for everything here.
const buildFilters = (condition: LogicalTerm | Formula): FilterField[] => {
  const filters: FilterField[] = [];

  if ((condition as LogicalTerm).conditions !== undefined) {
    filters.push(
      ...flatMap(
        (condition as LogicalTerm).conditions.map(c => buildFilters(c))
      )
    );
    return filters;
  }

  // This is a Formula so pull apart the expression function,
  // field and value(s) and build our Report filter info from that
  const formula = condition as Formula;
  const args = [...formula.args];
  const field = args.shift() as DataExpression;
  const isDateFilter =
    field.dataSourceField?.filterType === FilterType.Date ||
    field.dataSourceField?.filterType === FilterType.DateTime;
  filters.push({
    field: field.dataSourceField!,
    expressionFunction: formula.expressionFunction,
    value:
      args.length === 1
        ? isDateFilter
          ? parseISO(args[0].value)
          : args[0].value
        : args.map(a => (isDateFilter ? parseISO(a.value) : a.value)),
  });
  return filters;
};

// It's possible that we have multiple fields that resolve to the same
// DataSourceFieldName for filtering. Like if we show a Location Id
// column and a Location Name column. Both ultimately filter on the LocationId
// and the presence of the filterTypeDefinition will tell us if
// we need to use the filterDataSourceFieldName from that object.
const getFilterFieldName = (filterField: FilterField): string => {
  const dataSourceFieldName = filterField.field.filterTypeDefinition
    ? filterField.field.filterTypeDefinition.filterDataSourceFieldName
    : filterField.field.dataSourceFieldName;
  return dataSourceFieldName;
};

// For the Expressions that we support in the frontend we need to take our
// structure of those filters and convert them into valid Report Definition
// Language to send to the server. Adding handling for new Expressions will
// also require updates here to make sure we construct the correct string.
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
          `'${format(value[0], "MM/dd/yyyy")}'`,
          `'${format(value[1], "MM/dd/yyyy")}'`,
        ];
      } else {
        betweenValues = processFilterValue(value);
      }
      return `(${fieldName} BETWEEN ${betweenValues[0]} AND ${betweenValues[1]})`;
    }
    case ExpressionFunction.LessThan: {
      const equalValue = processFilterValue(value);
      return `(${fieldName} < '${equalValue}')`;
    }
    case ExpressionFunction.LessThanOrEqual: {
      const equalValue = processFilterValue(value);
      return `(${fieldName} <= '${equalValue}')`;
    }
    case ExpressionFunction.GreaterThan: {
      const equalValue = processFilterValue(value);
      return `(${fieldName} > '${equalValue}')`;
    }
    case ExpressionFunction.GreaterThanOrEqual: {
      const equalValue = processFilterValue(value);
      return `(${fieldName} >= '${equalValue}')`;
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

// Build a Report Definition Language string from our
// Report object that we are managing in this reducer
export const convertReportDefinitionInputToRdl = (
  report: Report,
  forExport?: boolean
): string => {
  const rdlPieces: string[] = [];
  rdlPieces.push(...getRdlFromAndWhere(report));

  const selects = [...report.selects];
  if (forExport && report.subtotalBy && report.subtotalBy.length > 0) {
    // When exporting a grouped report, we need to make sure
    // the things we are gouping by are represented in the data
    // that is going to be put into the file
    for (let i = report.subtotalBy.length - 1; i >= 0; i--) {
      const subtotalBy = report.subtotalBy[i];
      if (
        subtotalBy.showExpression &&
        !selects.includes(subtotalBy.showExpression)
      ) {
        selects.unshift(subtotalBy.showExpression);
      }
      if (
        !subtotalBy.showExpression &&
        !selects.includes(subtotalBy.expression)
      ) {
        selects.unshift(subtotalBy.expression);
      }
    }
  }

  rdlPieces.push(
    `SELECT ${selects
      .map(s => {
        return s.expressionAsQueryLanguage;
      })
      .join(", ")}`
  );

  if (report.orderBy && report.orderBy.length > 0) {
    rdlPieces.push(
      `ORDER BY ${report.orderBy
        .map(
          o =>
            `${o.expression.baseExpressionAsQueryLanguage} ${
              o.direction === Direction.Asc ? "ASC" : "DESC"
            }`
        )
        .join(", ")}`
    );
  }

  if (report.subtotalBy && report.subtotalBy.length > 0) {
    rdlPieces.push(
      `WITH SUBTOTALS ${report.subtotalBy
        .map(
          s =>
            `${s.expression.expressionAsQueryLanguage} ${
              s.showExpression
                ? `SHOW ${s.showExpression.expressionAsQueryLanguage}`
                : ""
            }`
        )
        .join(", ")}`
    );
  }

  // Keep the Chart information in the RDL
  rdlPieces.push(...getRdlChart(report));

  const rdlString = rdlPieces.join(" ");
  return rdlString;
};

const getRdlFromAndWhere = (report: Report) => {
  const rdlPieces: string[] = [];
  rdlPieces.push(`QUERY FROM ${report.from}`);

  if (report.filters && report.filters.length > 0) {
    const filterStrings = compact(
      report.filters.map(f =>
        buildFormula(getFilterFieldName(f), f.expressionFunction, f.value)
      )
    );
    rdlPieces.push(`WHERE ${filterStrings.join(" AND ")}`);
  }
  return rdlPieces;
};

const getRdlChart = (report: Report) => {
  const rdlPieces: string[] = [];
  if (!report.chart) {
    return rdlPieces;
  }

  rdlPieces.push("CHART");

  rdlPieces.push(
    report.chart.graphs
      .map(g => {
        return `${getGraphTypeString(g.type)} [${g.series
          .map(s => s.expressionAsQueryLanguage)
          .join(", ")}]${g.byExpression ? ` BY ${g.byExpression}` : ""}`;
      })
      .join(", ")
  );

  rdlPieces.push(`AGAINST ${report.chart.againstExpression}`);
  return rdlPieces;
};

export const convertReportDefinitionInputToRdlForChart = (
  report: Report
): string | null => {
  if (!report.chart) {
    return null;
  }

  const rdlPieces: string[] = [];
  rdlPieces.push(...getRdlFromAndWhere(report));
  rdlPieces.push(...getRdlChart(report));

  const rdlString = rdlPieces.join(" ");
  return rdlString;
};

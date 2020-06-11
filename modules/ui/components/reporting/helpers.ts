import { Index } from "react-virtualized";
import {
  Row,
  DataExpression,
  GraphType,
  FilterField,
  OrderByField,
} from "./types";
import { difference, differenceWith } from "lodash-es";

export const calculateRowHeight = ({ index }: Index, rows: Row[]) => {
  const row = rows[index];
  if (row.isGroupHeader) {
    return row.level === 0 ? 75 : 60;
  }
  return 55;
};

export const calculateColumnWidth = (
  { index }: Index,
  isGrouped: boolean,
  columns: DataExpression[]
) => {
  if (isGrouped && index === 0 && !columns[index]?.columnWidthPx) {
    return 300;
  }

  return (
    columns[index]?.columnWidthPx ??
    columns[index]?.dataSourceField?.defaultColumnWidthInPixels ??
    200
  );
};

export const findColumnIndex = (
  dataColumnIndexMap: Record<string, DataExpression>,
  dataExpression: DataExpression
): number => {
  let index = 0;
  Object.keys(dataColumnIndexMap).forEach(k => {
    if (dataColumnIndexMap[k].displayName === dataExpression.displayName) {
      index = Number(k);
    }
  });
  return index;
};

export const getGraphTypeString = (graphType: GraphType): string | null => {
  switch (graphType) {
    case GraphType.Bar:
      return "BAR";
    case GraphType.StackedBar:
      return "STACKEDBAR";
    case GraphType.Line:
      return "LINE";
    case GraphType.Pie:
      return "PIE";
  }
  return null;
};

export const filtersAreDifferent = (
  filters: FilterField[],
  otherFilters: FilterField[]
) => {
  if (filters.length !== otherFilters.length) {
    return true;
  }

  const differences = differenceWith(filters, otherFilters, filtersAreEqual);
  return differences.length > 0;
};

export const filtersAreEqual = (
  filter: FilterField,
  otherFilter: FilterField
) => {
  const sameFieldAndExpression =
    filter.field.dataSourceFieldName ===
      otherFilter.field.dataSourceFieldName &&
    filter.expressionFunction === otherFilter.expressionFunction;

  if (!sameFieldAndExpression) {
    return false;
  }

  if (!filter.value && !otherFilter.value) {
    return true;
  }

  if (!filter.value || !otherFilter.value) {
    return false;
  }

  if (Array.isArray(filter.value) && Array.isArray(otherFilter.value)) {
    if (filter.value.length !== otherFilter.value.length) {
      return false;
    }
    return difference(filter.value, otherFilter.value).length === 0;
  }

  if (!Array.isArray(filter.value) && !Array.isArray(otherFilter.value)) {
    return filter.value === otherFilter.value;
  }

  return false;
};

import { Index } from "react-virtualized";
import {
  Row,
  DataExpression,
  GraphType,
  FilterField,
  DataSourceField,
} from "./types";
import { difference, differenceWith } from "lodash-es";
import {
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  addMonths,
  isSameDay,
} from "date-fns";

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

export const convertToDataExpression = (
  fields: DataSourceField[],
  expression?: string,
  expressionAlias?: string
): DataExpression[] => {
  const dataExpressions: DataExpression[] = [
    ...fields.map(f => {
      return {
        displayName: f.friendlyName,
        expressionAsQueryLanguage: f.dataSourceFieldName,
        baseExpressionAsQueryLanguage: f.dataSourceFieldName,
        dataSourceField: f,
      };
    }),
  ];
  if (expression && expressionAlias) {
    dataExpressions.push({
      displayName: expressionAlias,
      expressionAsQueryLanguage: `${expression} AS ${expressionAlias}`,
      baseExpressionAsQueryLanguage: expression,
    });
  }
  return dataExpressions;
};

// TODO: Remove these when we're no longer persisting report changes
// to Local Storage and have Saved Views fully implemented
export const saveRdlToLocalStorage = (key: string, rdl: string) => {
  try {
    localStorage.setItem(key, rdl);
  } catch (e) {
    // This shouldn't happen, but also no reason to
    // affect the User if there is some sort of issue
  }
};

export const getRdlFromLocalStorage = (key: string): string | undefined => {
  let rdl = undefined;
  try {
    rdl = localStorage.getItem(key) ?? undefined;
  } catch (e) {
    // This shouldn't happen, but also no reason to
    // affect the User if there is some sort of issue
  }
  return rdl;
};

// Relative Date handling so we can convert between the actual dates and the
// RQL for the relative date grammar
const today = new Date();
const dateRangeToRelativeDateMap: {
  dateRange: Date[];
  relativeDates: string[];
}[] = [
  {
    // Last 7 Days
    dateRange: [addDays(today, -6), today],
    relativeDates: ["%-6d", "%0d"],
  },
  {
    // Last 30 Days
    dateRange: [addDays(today, -29), today],
    relativeDates: ["%-29d", "%0d"],
  },
  {
    // Today
    dateRange: [today, today],
    relativeDates: ["%0d", "%0d"],
  },
  {
    // This week
    dateRange: [startOfWeek(today), endOfWeek(today)],
    relativeDates: ["%sw", "%ew"],
  },
  {
    // This month
    dateRange: [startOfMonth(today), endOfMonth(today)],
    relativeDates: ["%sm", "%em"],
  },
  {
    // Last week
    dateRange: [
      startOfWeek(addWeeks(today, -1)),
      endOfWeek(addWeeks(today, -1)),
    ],
    relativeDates: ["%-1wsw", "%-1wew"],
  },
  {
    // Last month
    dateRange: [
      startOfMonth(addMonths(today, -1)),
      endOfMonth(addMonths(today, -1)),
    ],
    relativeDates: ["%-1msm", "%-1mem"],
  },
  {
    // Next week
    dateRange: [startOfWeek(addWeeks(today, 1)), endOfWeek(addWeeks(today, 1))],
    relativeDates: ["%1wsw", "%1wew"],
  },
  {
    // Next month
    dateRange: [
      startOfMonth(addMonths(today, 1)),
      endOfMonth(addMonths(today, 1)),
    ],
    relativeDates: ["%1msm", "%1mem"],
  },
  {
    // Next 7 Days
    dateRange: [today, addDays(today, 6)],
    relativeDates: ["%0d", "%6d"],
  },
];

export const getDateRangeFromRelativeDates = (
  from: string,
  to: string
): Date[] | undefined => {
  const match = dateRangeToRelativeDateMap.find(
    d => d.relativeDates[0] === from && d.relativeDates[1] === to
  );
  return match?.dateRange;
};

export const getRelativeDatesFromDateRange = (
  from: Date,
  to: Date
): string[] | undefined => {
  const match = dateRangeToRelativeDateMap.find(
    d => isSameDay(d.dateRange[0], from) && isSameDay(d.dateRange[1], to)
  );
  return match?.relativeDates;
};

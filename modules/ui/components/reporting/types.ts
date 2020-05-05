export type ReportDefinitionInput = {
  from: string;
  select: string[];
  orderBy?: {
    expression: string;
    direction: Direction;
  }[];
  filter?: {
    fieldName: string;
    expressionFunction: ExpressionFunction;
    value?: any;
  }[];
};

export type ReportDefinition = {
  data: ReportData;
  metadata: ReportMetadata;
};

export type ReportData = {
  rawData: any[][];
  dataColumnIndexMap: Record<string, DataExpression>;
};

export type ReportMetadata = {
  query: Query;
  numberOfColumns: number;
  numberOfLockedColumns: number;
};

export type Query = {
  selects: DataExpression[];
  filters: LogicalTerm | Formula;
  orderBy: OrderByField[];
  subtotalBy: SubtotalField[];
  schema: {
    name: string;
    allFields: DataSourceField[];
  };
};

export type LogicalTerm = {
  operator: LogicalOperator;
  conditions: (LogicalTerm | Formula)[];
};

export type Formula = {
  expressionFunction: ExpressionFunction;
  args: DataExpression[];
};

export type DataSourceField = {
  friendlyName: string;
  dataSourceFieldName: string;
  defaultColumnWidthInPixels?: number;
  isRequiredFilter: boolean;
  defaultExpressionFunction: ExpressionFunction;
  filterType?: FilterType;
  filterTypeDefinition?: {
    key: string;
    filterDataSourceFieldName: string;
    friendlyName: string;
  };
};

export enum FilterType {
  String = 0,
  Number = 1,
  Decimal = 2,
  Date = 3,
  Time = 4,
  DateTime = 5,
  Boolean = 6,
  Custom = 7,
}

export enum LogicalOperator {
  And = 0,
  Or = 1,
  Not = 2,
}

export enum ExpressionFunction {
  Add = 0,
  Subtract = 1,
  Multiply = 2,
  Divide = 3,
  Equal = 4,
  NotEqual = 5,
  GreaterThan = 6,
  GreaterThanOrEqual = 7,
  LessThan = 8,
  LessThanOrEqual = 9,
  ContainedIn = 10,
  Between = 11,
  EndsWith = 12,
  StartsWith = 13,
  Contains = 14,
  Sum = 15,
  SumIf = 16,
  Avg = 17,
  Count = 18,
  CountIf = 19,
  If = 20,
  Not = 21,
  Concat = 22,
  Left = 23,
  Right = 24,
  Upper = 25,
  Lower = 26,
  DateFormat = 27,
  Format = 28,
}

export type DataExpression = {
  displayName: string;
  dataSourceField?: DataSourceField;
};

export type OrderByField = {
  expression: DataExpression;
  direction: Direction;
};

export enum Direction {
  Asc = 0,
  Desc = 1,
}

export type SubtotalField = {
  expression: DataExpression;
  showExpression?: DataExpression;
};

export type FilterField = {
  field: DataSourceField;
  expressionFunction: ExpressionFunction;
  value?: any;
};

export type GroupedData = {
  info?: GroupInfo | null | undefined;
  children?: GroupedData[];
  data: any[][];
  subtotals: any[];
};

export type GroupInfo = {
  displayName: string;
  displayValue: any;
  groupByValue: any;
};

export type Row = {
  level: number;
  item: any[] | GroupedData;
  isGroupHeader: boolean;
  dataRowIndex?: number;
};

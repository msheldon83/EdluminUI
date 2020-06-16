// Structured view of the Report that is converted into RDL
export type Report = {
  from: string;
  selects: DataExpression[];
  filters?: FilterField[];
  orderBy?: OrderByField[];
  subtotalBy?: SubtotalField[];
  chart?: {
    graphs: {
      type: GraphType;
      series: DataExpression[];
      byExpression?: string;
    }[];
    againstExpression: string;
  };
  numberOfLockedColumns?: number;
};

export type FilterField = {
  field: DataSourceField;
  expressionFunction: ExpressionFunction;
  value?: any;
};

// Response from the server which represents the Report
export type DataExpression = {
  displayName: string;
  expressionAsQueryLanguage: string;
  baseExpressionAsQueryLanguage: string;
  dataSourceField?: DataSourceField;
  expressionFunction?: ExpressionFunction;
  args?: DataExpression[];
  alias?: string;
  columnWidthPx?: number;
  color?: string;
};

export type DataSourceField = {
  friendlyName: string;
  dataSourceFieldName: string;
  dataType: DataType;
  defaultColumnWidthInPixels?: number;
  isRequiredFilter: boolean;
  defaultExpressionFunction: ExpressionFunction;
  displayValueMap?: {
    value: string;
    display: string;
  }[];
  filterType?: FilterType;
  filterTypeDefinition?: {
    key: string;
    filterDataSourceFieldName: string;
    friendlyName: string;
    supportedExpressions: ExpressionFunction[];
  };
};

export type ReportDefinition = {
  data: ReportDefinitionData;
  metadata: ReportMetadata;
};

export type ReportDefinitionData = {
  rawData: any[][];
  dataColumnIndexMap: Record<string, DataExpression>;
};

export type ReportChartDefinition = {
  data: ReportChartData;
  metadata: ReportMetadata;
};

export type ReportChartData = {
  graphData: {
    rawData: any[][];
  }[];
  againstRawData: any[];
};

export type ReportMetadata = {
  query: Query;
  chart?: Chart;
  title?: string;
  dateStamp?: string;
  header?: string;
  footer?: string;
  numberOfColumns: number;
  numberOfLockedColumns: number;
};

export type Query = {
  selects: DataExpression[];
  filters?: LogicalTerm | Formula;
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
  args: (DataExpression & { value: any })[];
};

export type OrderByField = {
  expression: DataExpression;
  direction: Direction;
};

export type SubtotalField = {
  expression: DataExpression;
  showExpression?: DataExpression;
};

export type Chart = {
  graphs: {
    series: DataExpression[];
    type: GraphType;
    by: DataExpression | undefined;
  }[];
  against: DataExpression;
};

export enum DataType {
  String = 0,
  LongString = 1,
  Number = 2,
  Decimal = 3,
  Date = 4,
  Time = 5,
  DateTime = 6,
  Boolean = 7,
  Identifier = 8,
}

export enum FilterType {
  String = 0,
  Number = 1,
  Decimal = 2,
  Date = 3,
  Time = 4,
  DateTime = 5,
  Boolean = 6,
  Custom = 7,
  PredefinedSelection = 8,
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

export enum Direction {
  Asc = 0,
  Desc = 1,
}

export enum GraphType {
  Bar = 0,
  StackedBar = 1,
  Line = 2,
  Pie = 3,
}

// Structure used by the Data Grid to determine how and if
// groups of data are defined
export type GroupedData = {
  info?: GroupInfo | null | undefined;
  children?: GroupedData[];
  data: any[][];
  subtotals: any[];
};

// Contains information about how to display a group and what to group on
export type GroupInfo = {
  displayName: string;
  displayValue: any;
  groupByValue: any;
};

// What is used to render the cells within the Data Grid
// so all data is a row in the Grid regardless of if it
// is a group header or an actual row of data
export type Row = {
  level: number;
  item: any[] | GroupedData;
  isGroupHeader: boolean;
  dataRowIndex?: number;
};

export type CustomRenderer = (
  dataColumnIndexMap: Record<string, DataExpression>,
  index: number
) =>
  | ((dataClasses: string, displayValue: string, dataRow: any[]) => JSX.Element)
  | undefined;

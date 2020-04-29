export type ReportDefinitionInput = {
  from: string;
  select: string[];
  orderBy?: {
    expression: string;
    direction: Direction;
  }[];
  filter?: string[];
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
  orderBy: OrderByField[];
  subtotalBy: SubtotalField[];
};

export type DataExpression = {
  displayName: string;
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

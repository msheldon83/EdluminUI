import { Index } from "react-virtualized";
import { Row, DataExpression, GraphType } from "./types";

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
  dataColumnIndexMap: Record<string, DataExpression>
) => {
  if (isGrouped && index === 0 && !dataColumnIndexMap[index]?.columnWidthPx) {
    return 300;
  }

  return (
    dataColumnIndexMap[index]?.columnWidthPx ??
    dataColumnIndexMap[index]?.dataSourceField?.defaultColumnWidthInPixels ??
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

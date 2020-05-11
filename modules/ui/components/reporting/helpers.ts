import { Index } from "react-virtualized";
import { Row, DataExpression } from "./types";

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
  if (isGrouped && index === 0) {
    return 300;
  }
  return (
    dataColumnIndexMap[index].dataSourceField?.defaultColumnWidthInPixels ?? 200
  );
};

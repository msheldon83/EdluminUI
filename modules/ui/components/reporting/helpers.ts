import { Index } from "react-virtualized";
import { Row } from "./types";

export const calculateRowHeight = ({ index }: Index, rows: Row[]) => {
  const row = rows[index];
  if (row.isGroupHeader) {
    return row.level === 0 ? 75 : 60;
  }
  return 50;
};

export const calculateColumnWidth = ({ index }: Index, isGrouped: boolean) => {
  if (isGrouped && index === 0) {
    return 300;
  }
  return 200;
};

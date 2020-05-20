import { Index } from "react-virtualized";
import { Row, DataExpression, GraphType, SelectField } from "./types";
import { compact } from "lodash-es";

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
  dataColumnIndexMap: Record<string, DataExpression>,
  inputSelects: SelectField[]
) => {
  if (isGrouped && index === 0) {
    return 300;
  }

  const visibleMap = getVisibleDataColumnIndexMap(
    dataColumnIndexMap,
    inputSelects
  );

  return (
    inputSelects.filter(s => !s.hiddenFromReport)[index]?.width ??
    visibleMap[index]?.dataSourceField?.defaultColumnWidthInPixels ??
    200
  );
};

export const getVisibleData = (
  data: any[],
  inputSelects: SelectField[]
): any[] => {
  const visibleData: any[] = [];
  data.forEach((d, i) => {
    if (!inputSelects[i]?.hiddenFromReport) {
      visibleData.push(d);
    }
  });
  return visibleData;
};

export const getVisibleDataColumnIndexMap = (
  dataColumnIndexMap: Record<string, DataExpression>,
  inputSelects: SelectField[]
): Record<string, DataExpression> => {
  let object: Record<string, DataExpression> = {};
  let key = 0;
  Object.entries(dataColumnIndexMap).forEach((d, i) => {
    if (!inputSelects[i]?.hiddenFromReport) {
      const value = d[1];
      object = {
        ...object,
        [key.toString()]: value,
      };
      key = key + 1;
    }
  });
  return object;
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

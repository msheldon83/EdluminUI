import * as React from "react";
import {
  ReportDefinition,
  GroupedData,
  DataExpression,
  OrderByField,
  SubtotalField,
  Direction,
  Row,
} from "../types";
import {
  GridCellProps,
  AutoSizer,
  MultiGrid,
  ScrollSync,
  Index,
} from "react-virtualized";
import { makeStyles, CircularProgress, Typography } from "@material-ui/core";
import clsx from "clsx";
import { isNumber } from "lodash-es";
import { DataGridHeader } from "./data-grid-header";
import { calculateColumnWidth, calculateRowHeight } from "../helpers";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";

type Props = {
  reportDefinition: ReportDefinition;
  isLoading: boolean;
  showGroupLabels?: boolean;
};

export const DataGrid: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [groupedData, setGroupedData] = React.useState<GroupedData[]>([]);
  const {
    isLoading,
    reportDefinition: { data: reportData, metadata },
    showGroupLabels = true,
  } = props;

  // Convert report data into a grouped structure.
  // A Report with no explicit groupings will result in a single group with all data.
  React.useEffect(() => {
    if (!reportData) {
      return;
    }

    const groupedDataResult = groupAndSortData(
      reportData.rawData,
      reportData.dataColumnIndexMap,
      metadata.query.orderBy ?? [],
      metadata.query.subtotalBy ?? []
    );
    setGroupedData(groupedDataResult);
  }, [reportData, metadata.query.orderBy, metadata.query.subtotalBy]);

  // We're maintaining a data structure around groups, but in order
  // to benefit from the windowing React Virtualized gives us, we
  // need to put all of our data into a single MultiGrid so everything
  // ultimately ends up as a row whether that row is a group header
  // with subtotals or just a row showing raw data
  const rows = React.useMemo(() => {
    return buildRows(groupedData);
  }, [groupedData]);

  const numberOfLockedColumns = React.useMemo(() => {
    return rows.length > 0 ? metadata.numberOfLockedColumns : 0;
  }, [metadata, rows.length]);

  const isGrouped = React.useMemo(() => {
    return (metadata.query.subtotalBy ?? []).length > 0;
  }, [metadata]);

  const dataGridHeight = 75;
  const summaryGridHeight = 50;

  return (
    <>
      {isLoading && (
        <div className={classes.overlay}>
          <CircularProgress />
        </div>
      )}
      <AutoSizer>
        {({ width, height }) => (
          <ScrollSync>
            {({ onScroll, scrollLeft }) => (
              <div>
                <DataGridHeader
                  columns={metadata.query.selects.map(s => s.displayName)}
                  numberOfLockedColumns={numberOfLockedColumns}
                  onScroll={onScroll}
                  scrollLeft={scrollLeft}
                  height={dataGridHeight}
                  width={width}
                  columnWidth={(params: Index) =>
                    calculateColumnWidth(
                      params,
                      isGrouped,
                      reportData.dataColumnIndexMap
                    )
                  }
                />
                {!isGrouped && groupedData[0]?.subtotals && rows.length > 0 && (
                  <MultiGrid
                    onScroll={onScroll}
                    scrollLeft={scrollLeft}
                    fixedColumnCount={numberOfLockedColumns}
                    fixedRowCount={1}
                    cellRenderer={props =>
                      summaryHeaderRenderer(
                        groupedData[0]?.subtotals,
                        rows.length,
                        props,
                        classes,
                        t
                      )
                    }
                    columnWidth={(params: Index) =>
                      calculateColumnWidth(
                        params,
                        isGrouped,
                        reportData.dataColumnIndexMap
                      )
                    }
                    estimatedColumnSize={120}
                    columnCount={metadata.numberOfColumns ?? 0}
                    height={summaryGridHeight}
                    rowHeight={summaryGridHeight}
                    rowCount={1}
                    width={width}
                    classNameTopLeftGrid={classes.dataGridLockedColumns}
                    classNameTopRightGrid={classes.dataGrid}
                    style={isLoading ? { opacity: 0.5 } : undefined}
                  />
                )}
                <MultiGrid
                  onScroll={onScroll}
                  scrollLeft={scrollLeft}
                  fixedColumnCount={numberOfLockedColumns}
                  cellRenderer={props =>
                    cellRenderer(rows, props, classes, t, showGroupLabels)
                  }
                  columnWidth={(params: Index) =>
                    calculateColumnWidth(
                      params,
                      isGrouped,
                      reportData.dataColumnIndexMap
                    )
                  }
                  estimatedColumnSize={120}
                  columnCount={metadata.numberOfColumns ?? 0}
                  height={
                    height -
                    (isGrouped
                      ? dataGridHeight
                      : dataGridHeight + summaryGridHeight)
                  }
                  rowHeight={(params: Index) =>
                    calculateRowHeight(params, rows)
                  }
                  rowCount={rows.length}
                  width={width}
                  classNameBottomLeftGrid={classes.dataGridLockedColumns}
                  classNameBottomRightGrid={classes.dataGrid}
                  style={isLoading ? { opacity: 0.5 } : undefined}
                  noContentRenderer={() => (
                    <div className={classes.noResults}>
                      <Typography variant="h2">
                        {t("No results found for applied filters")}
                      </Typography>
                    </div>
                  )}
                />
              </div>
            )}
          </ScrollSync>
        )}
      </AutoSizer>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  dataGridLockedColumns: {
    backgroundColor: "rgba(255,255,255, 1)",
    borderLeft: "1px solid #E5E5E5",
    borderBottom: "1px solid #E5E5E5",
    borderRight: "1px solid #D1D1D1",
  },
  dataGrid: {
    backgroundColor: "rgba(255,255,255, 1)",
    borderRight: "1px solid #E5E5E5",
    borderBottom: "1px solid #E5E5E5",
    borderLeft: "1px solid #E5E5E5",
  },
  mainGroupHeaderRow: {
    borderTop: "1px solid #E5E5E5",
    marginTop: theme.typography.pxToRem(20),
    height: "100%",
  },
  mainGroupHeaderFirstCell: {
    //borderTopLeftRadius: 10,
  },
  groupHeaderRow: {
    backgroundColor: "#F8F8F8",
    borderTop: "1px solid #E5E5E5",
    borderBottom: "1px solid #E5E5E5",
    height: "100%",
    fontWeight: 600,
  },
  groupHeaderFirstCell: {
    marginLeft: theme.typography.pxToRem(10),
    borderLeft: "1px solid #E5E5E5",
    paddingTop: 0,
  },
  groupHeaderCell: {
    padding: 10,
  },
  groupHeaderLayout: {
    display: "flex",
    justifyContent: "space-between",
  },
  groupNesting: {
    marginLeft: 10,
    height: "100%",
    borderLeft: "1px solid #E5E5E5",
    backgroundColor: "#C8C8C8",
  },
  firstGroupedDataCell: {
    padding: theme.typography.pxToRem(10),
    paddingLeft: theme.typography.pxToRem(30),
  },
  cell: {
    padding: theme.typography.pxToRem(10),
  },
  dataRow: {
    background: "rgba(255,255,255, 1)",
    height: "100%",
    borderBottom: "1px solid #E5E5E5",
    borderTop: "1px solid #E5E5E5",
  },
  alternatingDataRow: {
    background: "#F0F0F0",
    borderBottom: "1px solid #E5E5E5",
    height: "100%",
  },
  action: {
    cursor: "pointer",
  },
  overlay: {
    position: "relative",
    top: theme.typography.pxToRem(100),
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    height: 0,
    zIndex: 1,
  },
  noResults: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.typography.pxToRem(50),
  },
  summaryRow: {
    background: "rgba(61, 78, 215, 0.2)",
  },
  summaryRowHeader: {
    fontWeight: 600,
  },
}));

const summaryHeaderRenderer = (
  subtotals: any[],
  rowCount: number,
  { columnIndex, key, style }: GridCellProps,
  classes: any,
  t: TFunction
) => {
  const cellClasses = clsx({
    [classes.summaryRowHeader]: true,
    [classes.cell]: true,
    [classes.summaryRow]: true,
  });

  if (columnIndex === 0) {
    return (
      <div key={key} style={style} className={cellClasses}>
        {`${rowCount} ${rowCount === 1 ? t("row") : t("rows")}`}
      </div>
    );
  }

  return (
    <div key={key} style={style} className={cellClasses}>
      {subtotals[columnIndex]}
    </div>
  );
};

const dataCellRenderer = (
  data: any[],
  level: number,
  dataRowIndex: number,
  { columnIndex, key, rowIndex, style }: GridCellProps,
  classes: any
) => {
  const dataValue =
    typeof data[columnIndex] === "boolean"
      ? data[columnIndex]
        ? "Y"
        : "N"
      : data[columnIndex] ?? "--";
  const isAlternatingRow = dataRowIndex % 2 !== 0;
  const isNormalRow = !isAlternatingRow;

  const dataClasses = clsx({
    [classes.alternatingDataRow]: isAlternatingRow,
    [classes.dataRow]: isNormalRow,
    [classes.cell]: columnIndex > 0 || level === 0,
    [classes.firstGroupedDataCell]: columnIndex === 0 && level > 0,
  });

  if (columnIndex === 0) {
    return (
      <div key={key} style={style}>
        {nestDivs(
          0,
          level,
          <div className={dataClasses}>{dataValue}</div>,
          classes.groupNesting
        )}
      </div>
    );
  }

  return (
    <div key={key} style={style}>
      <div className={dataClasses}>{dataValue}</div>
    </div>
  );
};

const groupHeaderCellRenderer = (
  group: GroupedData,
  level: number,
  { columnIndex, key, style }: GridCellProps,
  classes: any,
  t: TFunction,
  showGroupLabels: boolean
) => {
  const dataClasses = clsx({
    [classes.groupHeaderRow]: true,
    [classes.groupHeaderFirstCell]: columnIndex === 0,
    [classes.groupHeaderCell]: columnIndex > 0,
    [classes.mainGroupHeaderRow]: level === 0,
    [classes.mainGroupHeaderFirstCell]: columnIndex === 0 && level === 0,
  });

  if (columnIndex === 0) {
    return (
      <div key={key} style={style}>
        <div className={dataClasses}>
          {nestDivs(
            0,
            level,
            <div className={`${classes.cell} ${classes.groupHeaderLayout}`}>
              <div>
                {showGroupLabels && <div>{group.info?.displayName}</div>}
                <div>{group.info?.displayValue}</div>
              </div>
              <div>{`${group.data.length} ${
                group.data.length === 1 ? t("row") : t("rows")
              }`}</div>
            </div>,
            classes.groupNesting
          )}
        </div>
      </div>
    );
  }

  return (
    <div key={key} style={style}>
      <div className={dataClasses}>{group.subtotals[columnIndex]}</div>
    </div>
  );
};

const cellRenderer = (
  rows: Row[],
  gridProps: GridCellProps,
  classes: any,
  t: TFunction,
  showGroupLabels: boolean
) => {
  const row = rows[gridProps.rowIndex];
  if (Array.isArray(row.item)) {
    return dataCellRenderer(
      row.item,
      row.level,
      row.dataRowIndex ?? 0,
      gridProps,
      classes
    );
  } else {
    return groupHeaderCellRenderer(
      row.item,
      row.level,
      gridProps,
      classes,
      t,
      showGroupLabels
    );
  }
};

const nestDivs = (
  currentLevel: number,
  finalLevel: number,
  displayCell: JSX.Element,
  nestClassName?: string
) => {
  if (currentLevel === finalLevel) {
    return displayCell;
  } else {
    return (
      <div className={nestClassName}>
        {nestDivs(currentLevel + 1, finalLevel, displayCell, nestClassName)}
      </div>
    );
  }
};

const groupAndSortData = (
  data: any[][],
  dataColumnIndexMap: Record<string, DataExpression>,
  orderBy: OrderByField[],
  subtotalBy: SubtotalField[]
): GroupedData[] => {
  const groupByFields = Array.from(subtotalBy ?? []);
  const groupBy = groupByFields[0];
  if (!groupBy) {
    const localData = Array.from(data ?? []);
    if (orderBy.length > 0) {
      // TODO: Address in V2 or move ordering to server
      // Sort the data according to our orderBy
      // const orderByColumnIndexes = orderBy.map(o =>
      //   findColumnIndex(dataColumnIndexMap, o.expression)
      // );
      // localData.sort((a, b) => {
      //   const equalReturnValue = 0;
      //   for (let i = 0; i < orderByColumnIndexes.length; i++) {
      //     const orderByColumnIndex = orderByColumnIndexes[i];
      //     const sortAsc = orderBy[i].direction === Direction.Asc;
      //     if (a[orderByColumnIndex] < b[orderByColumnIndex]) {
      //       return sortAsc ? -1 : 1;
      //     }
      //     if (a[orderByColumnIndex] > b[orderByColumnIndex]) {
      //       return sortAsc ? 1 : -1;
      //     }
      //   }
      //   return equalReturnValue;
      // });
    }

    return [
      {
        data: localData,
        subtotals: localData.reduce((subtotals: any[], row: any[]) => {
          const subtotalRow = sumRows(row, subtotals);
          return subtotalRow;
        }, []),
      },
    ];
  }

  // Figure out the column index for this groupBy for what to group the data on
  const groupByColumnIndex = findColumnIndex(
    dataColumnIndexMap,
    groupBy.expression
  );
  // Figure out the column index for this groupBy of what data to show as the group value
  const groupByShowColumnIndex = groupBy.showExpression
    ? findColumnIndex(dataColumnIndexMap, groupBy.showExpression)
    : groupByColumnIndex;

  const groups = data.reduce((groups: GroupedData[], row: any[]) => {
    // Current row's group by value
    const groupByValue = row[groupByColumnIndex];
    const groupByShowValue = row[groupByShowColumnIndex];

    // Find an existing group
    const matchingGroup = groups.find(
      g => g.info?.groupByValue === groupByValue
    );

    // Add to existing or create a new group
    if (matchingGroup) {
      matchingGroup.data.push(row);
      matchingGroup.subtotals = sumRows(matchingGroup.subtotals, row);
    } else {
      groups.push({
        info: {
          displayName:
            groupBy.showExpression?.displayName ??
            groupBy.expression.displayName,
          displayValue: groupByShowValue,
          groupByValue: groupByValue,
        },
        data: [row],
        subtotals: sumRows(row, []),
      });
    }

    return groups;
  }, []);

  if (subtotalBy.length) {
    groups.forEach(g => {
      g.children = groupAndSortData(
        g.data,
        dataColumnIndexMap,
        orderBy,
        groupByFields.slice(1)
      );
    });
  }

  return groups;
};

const sumRows = (row1: any[], row2: any[]) => {
  const row: any[] = [];
  for (let index = 0; index < row1.length; index++) {
    const item1 = row1[index];
    const item2 = row2[index];

    if (isNumber(item1) && isNumber(item2)) {
      row.push(item1 + item2);
    } else if (isNumber(item1)) {
      row.push(item1);
    } else if (isNumber(item2)) {
      row.push(item2);
    } else {
      row.push(null);
    }
  }
  return row;
};

const findColumnIndex = (
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

const buildRows = (data: GroupedData[], level = 0): Row[] => {
  const rows = data.reduce((rows: Row[], currentGroup) => {
    const hasChildren = !!(
      currentGroup.children && currentGroup.children.length > 0
    );

    if (currentGroup.info) {
      // We're going to add a row for the Group
      rows.push({ level, item: currentGroup, isGroupHeader: true });
    }

    if (hasChildren) {
      // Recurse through the children building up the rows
      rows.push(...buildRows(currentGroup.children!, level + 1));
    } else {
      // At the end of the grouping, add each of the data items as a row
      rows.push(
        ...currentGroup.data.map((d, i) => {
          return {
            level: level,
            item: d,
            dataRowIndex: i,
            isGroupHeader: false,
          };
        })
      );
    }
    return rows;
  }, []);
  return rows;
};

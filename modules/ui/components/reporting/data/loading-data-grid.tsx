import * as React from "react";
import { AutoSizer, MultiGrid, GridCellProps } from "react-virtualized";
import { makeStyles, CircularProgress } from "@material-ui/core";
import clsx from "clsx";
import { DataGridHeader } from "./data-grid-header";
import { DataExpression } from "../types";

type Props = {
  numberOfColumns?: number;
};

export const LoadingDataGrid: React.FC<Props> = props => {
  const classes = useStyles();
  const columnCount = props.numberOfColumns ?? 20;
  const columnWidth = 200;
  const rowCount = 100;

  const columns: DataExpression[] = [];
  Array(columnCount).forEach(x =>
    columns.push({
      displayName: "...",
      expressionAsQueryLanguage: x,
      baseExpressionAsQueryLanguage: x,
    })
  );

  return (
    <>
      <div className={classes.overlay}>
        <CircularProgress />
      </div>
      <AutoSizer>
        {({ width, height }) => (
          <div>
            <div>
              <DataGridHeader
                columns={columns}
                height={50}
                width={width}
                columnWidth={columnWidth}
                setFirstLevelOrderBy={async () => {}}
                orderedBy={[]}
                allFields={[]}
                addColumns={() => {}}
                setColumns={() => {}}
                removeColumn={() => {}}
              />
            </div>
            <div>
              <MultiGrid
                columnWidth={columnWidth}
                columnCount={columnCount}
                height={height - 50}
                rowHeight={50}
                rowCount={rowCount}
                width={width}
                cellRenderer={props => cellRenderer(props, classes)}
                style={{ opacity: 0.7 }}
                styleBottomRightGrid={{ overflowY: "hidden" }}
              />
            </div>
          </div>
        )}
      </AutoSizer>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  dataRow: {
    background: "rgba(255,255,255, 1)",
    height: "100%",
    borderBottom: "1px solid #E5E5E5",
  },
  alternatingDataRow: {
    background: "#F0F0F0",
    borderBottom: "1px solid #E5E5E5",
    height: "100%",
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
}));

const cellRenderer = (
  { columnIndex, key, rowIndex, style }: GridCellProps,
  classes: any
) => {
  const isAlternatingRow = rowIndex % 2 !== 0;
  const isNormalRow = !isAlternatingRow;

  const dataClasses = clsx({
    [classes.alternatingDataRow]: isAlternatingRow,
    [classes.dataRow]: isNormalRow,
  });

  return (
    <div key={key} style={style}>
      <div className={dataClasses}> </div>
    </div>
  );
};

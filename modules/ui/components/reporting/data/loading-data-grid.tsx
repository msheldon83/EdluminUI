import * as React from "react";
import { AutoSizer, MultiGrid, GridCellProps } from "react-virtualized";
import { makeStyles, CircularProgress } from "@material-ui/core";
import clsx from "clsx";

export const LoadingDataGrid: React.FC<{}> = props => {
  const classes = useStyles();

  return (
    <>
      <div className={classes.overlay}>
        <CircularProgress />
      </div>
      <AutoSizer>
        {({ width, height }) => (
          <MultiGrid
            columnWidth={120}
            columnCount={30}
            height={height}
            rowHeight={50}
            rowCount={100}
            width={width}
            cellRenderer={props => cellRenderer(props, classes)}
            style={{ opacity: 0.8 }}
            styleBottomRightGrid={{ overflowY: "hidden" }}
          />
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

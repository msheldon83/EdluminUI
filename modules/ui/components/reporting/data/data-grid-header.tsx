import * as React from "react";
import { makeStyles, Menu, MenuItem } from "@material-ui/core";
import { ArrowDropDown } from "@material-ui/icons";
import { DataExpression } from "../types";
import { GridCellProps, MultiGrid, MultiGridProps } from "react-virtualized";
import { useTranslation } from "react-i18next";

type Props = {
  selects: DataExpression[];
  numberOfLockedColumns: number;
  onScroll: MultiGridProps["onScroll"];
  scrollLeft: MultiGridProps["scrollLeft"];
  width: MultiGridProps["width"];
  columnWidth: MultiGridProps["columnWidth"];
};

export const DataGridHeader: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const {
    selects,
    numberOfLockedColumns,
    onScroll,
    scrollLeft,
    width,
    columnWidth,
  } = props;

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const headerCellRenderer = React.useCallback(
    (selects: DataExpression[], { columnIndex, key, style }: GridCellProps) => {
      const headerDisplayName = selects[columnIndex]?.displayName;
      return (
        <div key={key} style={style} className={classes.headerCell}>
          <div>{headerDisplayName}</div>
          <div onClick={handleMenuClick} className={classes.action}>
            <ArrowDropDown />
          </div>
        </div>
      );
    },
    [classes.action, classes.headerCell]
  );

  const menuItems = [t("Sort A > Z"), t("Sort Z > A")];

  return (
    <>
      <MultiGrid
        onScroll={onScroll}
        scrollLeft={scrollLeft}
        width={width}
        columnWidth={columnWidth}
        fixedColumnCount={numberOfLockedColumns}
        fixedRowCount={1}
        cellRenderer={props => headerCellRenderer(selects, props)}
        estimatedColumnSize={120}
        columnCount={selects.length}
        height={50}
        rowHeight={50}
        rowCount={1}
        classNameTopLeftGrid={classes.headerGridLockedColumns}
        classNameTopRightGrid={classes.headerGrid}
      />
      <Menu
        anchorEl={anchorEl}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        keepMounted
        open={open}
        onClose={handleCloseMenu}
        PaperProps={{
          className: classes.headerMenu,
        }}
      >
        {menuItems.map((m, i) => {
          return (
            <MenuItem
              key={i}
              onClick={handleCloseMenu}
              className={classes.headerMenuItem}
            >
              {m}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  headerGridLockedColumns: {
    backgroundColor: "rgba(255,255,255, 1)",
    borderLeft: "1px solid #E5E5E5",
    borderRight: "1px solid #D1D1D1",
  },
  headerGrid: {
    backgroundColor: "rgba(255,255,255, 1)",
    borderRight: "1px solid #E5E5E5",
  },
  headerCell: {
    borderTop: "1px solid #E5E5E5",
    borderRight: "1px solid #E5E5E5",
    borderBottom: "1px solid #E5E5E5",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 10px 0 10px",
  },
  headerMenu: {
    width: 200,
    marginTop: 25,
    color: "rgba(255,255,255, 1)",
    background: "rgba(5, 0, 57, 0.8)",
    boxShadow: "0px 4px 7px rgba(0, 0, 0, 0.25)",
  },
  headerMenuItem: {
    "&:hover": {
      background: "rgba(1, 0, 99, 0.8)",
      opacity: 1,
    },
  },
  action: {
    cursor: "pointer",
  },
}));

import * as React from "react";
import { makeStyles, Menu, MenuItem } from "@material-ui/core";
import { ArrowDropDown } from "@material-ui/icons";
import { GridCellProps, MultiGrid, MultiGridProps } from "react-virtualized";
import { useTranslation } from "react-i18next";
import { OrderByField } from "../types";

type Props = {
  columns: string[];
  height: MultiGridProps["height"];
  width: MultiGridProps["width"];
  columnWidth: MultiGridProps["columnWidth"];
  numberOfLockedColumns?: number;
  onScroll?: MultiGridProps["onScroll"];
  scrollLeft?: MultiGridProps["scrollLeft"];
};

export const DataGridHeader: React.FC<Props> = props => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const {
    columns,
    onScroll,
    scrollLeft,
    height,
    width,
    columnWidth,
    numberOfLockedColumns = 0,
  } = props;

  // TODO: For V1 we're not supporting this, but will want to add in items as we implement them
  //const menuItems = [t("Sort A > Z"), t("Sort Z > A")];
  const menuItems: string[] = React.useMemo(() => [], []);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const headerCellRenderer = React.useCallback(
    (columns: string[], { columnIndex, key, style }: GridCellProps) => {
      return (
        <div key={key} style={style} className={classes.headerCell}>
          <div>{columns[columnIndex]}</div>
          {menuItems && menuItems.length > 0 && (
            <div onClick={handleMenuClick} className={classes.action}>
              <ArrowDropDown />
            </div>
          )}
        </div>
      );
    },
    [menuItems, classes.action, classes.headerCell]
  );

  return (
    <>
      <MultiGrid
        onScroll={onScroll}
        scrollLeft={scrollLeft}
        width={width}
        columnWidth={columnWidth}
        fixedColumnCount={numberOfLockedColumns}
        cellRenderer={props => headerCellRenderer(columns, props)}
        estimatedColumnSize={120}
        columnCount={columns.length}
        height={height}
        rowHeight={height}
        rowCount={1}
        classNameBottomLeftGrid={classes.headerGridLockedColumns}
        classNameBottomRightGrid={classes.headerGrid}
        styleBottomRightGrid={{
          overflowY: "hidden",
        }}
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
    background: "#F8F8F8",
    borderLeft: "1px solid #E5E5E5",
    borderRight: "1px solid #D1D1D1",
  },
  headerGrid: {
    background: "#F8F8F8",
    borderRight: "1px solid #E5E5E5",
    borderLeft: "1px solid #E5E5E5",
  },
  headerCell: {
    borderTop: "1px solid #E5E5E5",
    borderBottom: "1px solid #E5E5E5",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 10px 10px 10px",
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

import * as React from "react";
import { makeStyles, Menu, MenuItem } from "@material-ui/core";
import { ArrowDropDown } from "@material-ui/icons";
import { GridCellProps, MultiGrid, MultiGridProps } from "react-virtualized";
import { useTranslation } from "react-i18next";
import { Direction } from "../types";

type Props = {
  columns: string[];
  height: MultiGridProps["height"];
  width: MultiGridProps["width"];
  setOrderBy: (columnIndex: number, direction: Direction) => Promise<void>;
  columnWidth: MultiGridProps["columnWidth"];
  numberOfLockedColumns?: number;
  onScroll?: MultiGridProps["onScroll"];
  scrollLeft?: MultiGridProps["scrollLeft"];
};

type HeaderMenuItem = {
  label: string;
  onClick: (columnIndex: number) => Promise<void>;
};

export const DataGridHeader: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [menuInfo, setMenuInfo] = React.useState<null | {
    columnIndex: number;
    anchor: HTMLElement;
  }>(null);
  const open = Boolean(menuInfo?.anchor);
  const {
    columns,
    onScroll,
    scrollLeft,
    height,
    width,
    columnWidth,
    setOrderBy,
    numberOfLockedColumns = 0,
  } = props;

  const menuItems: HeaderMenuItem[] = [
    {
      label: t("Sort A > Z"),
      onClick: async (columnIndex: number) => {
        await setOrderBy(columnIndex, Direction.Asc);
      },
    },
    {
      label: t("Sort Z > A"),
      onClick: async (columnIndex: number) => {
        await setOrderBy(columnIndex, Direction.Desc);
      },
    },
  ];

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    columnIndex: number
  ) => {
    setMenuInfo({ columnIndex, anchor: event.currentTarget });
  };

  const handleCloseMenu = () => {
    setMenuInfo(null);
  };

  const headerCellRenderer = React.useCallback(
    (columns: string[], { columnIndex, key, style }: GridCellProps) => {
      return (
        <div key={key} style={style} className={classes.headerCell}>
          <div>{columns[columnIndex]}</div>
          {menuItems && menuItems.length > 0 && (
            <div
              onClick={e => handleMenuClick(e, columnIndex)}
              className={classes.action}
            >
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
        anchorEl={menuInfo?.anchor}
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
              onClick={async () => {
                handleCloseMenu();
                await m.onClick(menuInfo!.columnIndex);
              }}
              className={classes.headerMenuItem}
            >
              {m.label}
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
    boxShadow: "inset -3px 0px 3px rgba(0, 0, 0, 0.05)",
  },
  headerGrid: {
    background: "#F8F8F8",
    borderRight: "1px solid #E5E5E5",
    borderLeft: "1px solid #E5E5E5",
    boxShadow: "inset -3px 0px 3px rgba(0, 0, 0, 0.05)",
  },
  headerCell: {
    borderTop: "1px solid #E5E5E5",
    borderBottom: "1px solid #E5E5E5",
    fontWeight: 600,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: "0 10px 20px 10px",
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

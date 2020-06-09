import * as React from "react";
import { makeStyles, Menu, MenuItem } from "@material-ui/core";
import { ArrowDropDown, ArrowDownward, ArrowUpward } from "@material-ui/icons";
import { GridCellProps, MultiGrid, MultiGridProps } from "react-virtualized";
import { useTranslation } from "react-i18next";
import {
  Direction,
  DataExpression,
  OrderByField,
  DataSourceField,
} from "../types";
import { AddColumnsDialog } from "./actions/columns/add-columns-dialog";

type Props = {
  columns: DataExpression[];
  allFields: DataSourceField[];
  height: MultiGridProps["height"];
  width: MultiGridProps["width"];
  setFirstLevelOrderBy: (
    expression: DataExpression,
    direction: Direction
  ) => void;
  orderedBy: OrderByField[];
  removeColumn: (index: number) => void;
  columnWidth: MultiGridProps["columnWidth"];
  numberOfLockedColumns?: number;
  onScroll?: MultiGridProps["onScroll"];
  scrollLeft?: MultiGridProps["scrollLeft"];
};

type HeaderMenuItem = {
  label: string;
  onClick: (expression: DataExpression) => Promise<void>;
};

export const DataGridHeader: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [menuInfo, setMenuInfo] = React.useState<null | {
    expression: DataExpression;
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
    orderedBy,
    setFirstLevelOrderBy,
    removeColumn,
    numberOfLockedColumns = 0,
  } = props;

  const menuItems: HeaderMenuItem[] = [
    {
      label: t("Sort A > Z"),
      onClick: async (expression: DataExpression) => {
        setFirstLevelOrderBy(expression, Direction.Asc);
      },
    },
    {
      label: t("Sort Z > A"),
      onClick: async (expression: DataExpression) => {
        setFirstLevelOrderBy(expression, Direction.Desc);
      },
    },
    {
      label: t("Add column before"),
      onClick: async (expression: DataExpression) => {
        //setFirstLevelOrderBy(expression, Direction.Desc);
      },
    },
    {
      label: t("Add column after"),
      onClick: async (expression: DataExpression) => {
        //setFirstLevelOrderBy(expression, Direction.Desc);
      },
    },
    {
      label: t("Delete column"),
      onClick: async (expression: DataExpression) => {
        const columnIndex = columns.indexOf(expression);
        removeColumn(columnIndex);
      },
    },
  ];

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    expression: DataExpression
  ) => {
    setMenuInfo({ expression, anchor: event.currentTarget });
  };

  const handleCloseMenu = () => {
    setMenuInfo(null);
  };

  const headerCellRenderer = React.useCallback(
    (columns: DataExpression[], { columnIndex, key, style }: GridCellProps) => {
      const expression = columns[columnIndex];
      const orderByDirection = getOrderByDirection(expression, orderedBy);
      return (
        <div key={key} style={style} className={classes.headerCell}>
          {orderByDirection === Direction.Asc && <ArrowUpward />}
          {orderByDirection === Direction.Desc && <ArrowDownward />}
          <div>{expression.displayName}</div>
          {menuItems && menuItems.length > 0 && (
            <div
              onClick={e => handleMenuClick(e, expression)}
              className={classes.action}
            >
              <ArrowDropDown />
            </div>
          )}
        </div>
      );
    },
    [menuItems, orderedBy, classes.action, classes.headerCell]
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
                await m.onClick(menuInfo!.expression);
              }}
              className={classes.headerMenuItem}
            >
              {m.label}
            </MenuItem>
          );
        })}
      </Menu>
      <AddColumnsDialog
        columns={columns}
        allFields={[]}
        addColumns={() => {}}
        refreshReport={() => {}}
      />
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

const getOrderByDirection = (
  field: DataExpression,
  orderedBy: OrderByField[]
): Direction | undefined => {
  const orderByMatch = orderedBy.find(
    o =>
      o.expression.baseExpressionAsQueryLanguage ===
      field.baseExpressionAsQueryLanguage
  );
  return orderByMatch?.direction;
};

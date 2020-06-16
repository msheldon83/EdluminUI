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
import {
  Droppable,
  DragDropContext,
  DropResult,
  Draggable,
  DroppableProvided,
  DragStart,
} from "react-beautiful-dnd";
import { isFunction } from "lodash-es";

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
  addColumns: (
    columns: DataExpression[],
    index?: number,
    addBeforeIndex?: boolean
  ) => void;
  setColumns: (columns: DataExpression[]) => void;
  removeColumn: (index: number) => void;
  columnWidth: MultiGridProps["columnWidth"];
  numberOfLockedColumns?: number;
  onScroll?: MultiGridProps["onScroll"];
  scrollLeft?: MultiGridProps["scrollLeft"];
  gridRef?: React.RefObject<MultiGrid>;
};

type HeaderMenuItem = {
  label: string;
  onClick: (expression: DataExpression) => Promise<void>;
};

export const DataGridHeader: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  // Information necessary to know which column header the Menu
  // is currently open for in order to execute the actions correctly
  const [menuInfo, setMenuInfo] = React.useState<null | {
    expression: DataExpression;
    anchor: HTMLElement;
  }>(null);
  // Information necessary to know where we should add the new columns
  // into the list and if it should be before or after that index
  const [addColumnsInfo, setAddColumnsInfo] = React.useState<null | {
    index: number;
    before: boolean;
  }>(null);
  // Due to using react-beautiful-dnd within a react-virtualized grid there
  // were issues with the surrounding columns moving left or right correctly
  // when dragging was occurring so we're applying an offset based on the
  // column being dragged and keeping track of that info here
  const [draggingDetails, setDraggingDetails] = React.useState<
    | {
        sourceIndex?: number | undefined;
        dragColumnWidth?: number | undefined;
      }
    | undefined
  >();

  const {
    columns,
    onScroll,
    scrollLeft,
    height,
    width,
    columnWidth,
    orderedBy,
    setFirstLevelOrderBy,
    allFields,
    addColumns,
    setColumns,
    removeColumn,
    gridRef,
    numberOfLockedColumns = 0,
  } = props;

  const menuItems: HeaderMenuItem[] = React.useMemo(
    () => [
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
        label: t("Add columns before"),
        onClick: async (expression: DataExpression) => {
          const columnIndex = columns.indexOf(expression);
          setAddColumnsInfo({ index: columnIndex, before: true });
        },
      },
      {
        label: t("Add columns after"),
        onClick: async (expression: DataExpression) => {
          const columnIndex = columns.indexOf(expression);
          setAddColumnsInfo({ index: columnIndex, before: false });
        },
      },
      {
        label: t("Delete column"),
        onClick: async (expression: DataExpression) => {
          const columnIndex = columns.indexOf(expression);
          removeColumn(columnIndex);
        },
      },
    ],
    [columns, removeColumn, setFirstLevelOrderBy, t]
  );

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    expression: DataExpression
  ) => {
    setMenuInfo({ expression, anchor: event.currentTarget });
  };

  const handleCloseMenu = () => {
    setMenuInfo(null);
  };

  const getColumnWidth = React.useCallback(
    (columnIndex: number) => {
      let widthOfColumn = 0;
      if (isFunction(columnWidth)) {
        widthOfColumn = columnWidth({ index: columnIndex });
      } else {
        widthOfColumn = columnWidth;
      }
      return widthOfColumn;
    },
    [columns, columnWidth]
  );

  const headerCell = React.useCallback(
    (columns: DataExpression[], columnIndex: number) => {
      const expression = columns[columnIndex];
      const orderByDirection = getOrderByDirection(expression, orderedBy);
      return (
        <div className={classes.headerCell}>
          <div>
            {orderByDirection === Direction.Asc && (
              <ArrowUpward className={classes.sortIndicator} />
            )}
            {orderByDirection === Direction.Desc && (
              <ArrowDownward className={classes.sortIndicator} />
            )}
            {expression.displayName}
          </div>
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
    [classes.action, classes.headerCell, menuItems, orderedBy]
  );

  const headerCellRenderer = (
    columns: DataExpression[],
    { columnIndex, key, style }: GridCellProps,
    droppableProvided: DroppableProvided
  ) => {
    const expression = columns[columnIndex];
    return (
      <div
        key={key}
        style={{
          ...style,
          // This adjusts the offset of the column when dragging so the columns
          // not being dragged flow appropriately around the one that is
          left:
            (style.left &&
              draggingDetails?.sourceIndex &&
              columnIndex > draggingDetails?.sourceIndex) ||
            draggingDetails?.sourceIndex === 0
              ? Number(style.left) - (draggingDetails?.dragColumnWidth ?? 0)
              : style.left,
        }}
      >
        <Draggable
          key={expression.baseExpressionAsQueryLanguage}
          draggableId={expression.baseExpressionAsQueryLanguage}
          index={columnIndex}
        >
          {(provided, snapshot) => {
            const { innerRef } = provided;
            return (
              <div
                ref={innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={classes.draggable}
              >
                {headerCell(columns, columnIndex)}
              </div>
            );
          }}
        </Draggable>
        {droppableProvided.placeholder}
      </div>
    );
  };

  return (
    <>
      <DragDropContext
        onDragEnd={(result: DropResult) => {
          const updatedColumns = onDragEnd(result, columns);
          if (updatedColumns) {
            setColumns(updatedColumns);
          }
          setDraggingDetails(undefined);
        }}
        onDragStart={(start: DragStart) => {
          const indexBeingDragged = start.source.index;
          setDraggingDetails({
            sourceIndex: indexBeingDragged,
            dragColumnWidth: getColumnWidth(indexBeingDragged),
          });
        }}
      >
        <Droppable
          droppableId="columnOrder"
          direction="horizontal"
          renderClone={(provided, snapshot, rubric) => {
            const { innerRef } = provided;
            return (
              <div
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                ref={innerRef}
              >
                {headerCell(columns, rubric.source.index)}
              </div>
            );
          }}
        >
          {(provided, snapshot) => {
            const { innerRef } = provided;
            return (
              <>
                <div
                  ref={innerRef}
                  {...provided.droppableProps}
                  style={{ width: width }}
                >
                  <MultiGrid
                    ref={gridRef}
                    onScroll={onScroll}
                    scrollLeft={scrollLeft}
                    width={width}
                    columnWidth={columnWidth}
                    fixedColumnCount={numberOfLockedColumns}
                    cellRenderer={props =>
                      headerCellRenderer(columns, props, provided)
                    }
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
                </div>
              </>
            );
          }}
        </Droppable>
      </DragDropContext>
      <Menu
        anchorEl={menuInfo?.anchor}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        keepMounted
        open={Boolean(menuInfo?.anchor)}
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
        open={Boolean(addColumnsInfo?.index)}
        onClose={() => setAddColumnsInfo(null)}
        title={
          addColumnsInfo?.before
            ? t("Add columns before")
            : t("Add columns after")
        }
        columns={columns}
        allFields={allFields}
        addColumns={(columns: DataExpression[]) =>
          addColumns(columns, addColumnsInfo?.index, addColumnsInfo?.before)
        }
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
    fontWeight: 600,
    height: "100%",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: `0 ${theme.typography.pxToRem(10)} ${theme.typography.pxToRem(
      20
    )} ${theme.typography.pxToRem(10)}`,
  },
  sortIndicator: {
    marginRight: theme.spacing(),
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
  draggable: {
    height: "100%",
    width: "100%",
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

const onDragEnd = (
  result: DropResult,
  columns: DataExpression[]
): DataExpression[] | null => {
  const { destination, source, draggableId } = result;

  if (!destination) {
    return null;
  }

  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) {
    return null;
  }

  const columnBeingMoved = columns.find(
    c => c.baseExpressionAsQueryLanguage === draggableId
  );
  if (!columnBeingMoved) {
    return null;
  }

  const updatedColumns = [...columns].filter(
    c => c.baseExpressionAsQueryLanguage !== draggableId
  );
  updatedColumns.splice(destination.index, 0, columnBeingMoved);
  return updatedColumns;
};

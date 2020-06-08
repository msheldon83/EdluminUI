import * as React from "react";
import { DataExpression, OrderByField, Direction } from "../../../types";
import { useTranslation } from "react-i18next";
import {
  makeStyles,
  Button,
  Popper,
  Fade,
  ClickAwayListener,
} from "@material-ui/core";
import { SwapVert, DragHandle } from "@material-ui/icons";
import { OrderByRow } from "./order-by-row";
import {
  Droppable,
  DragDropContext,
  DropResult,
  Draggable,
} from "react-beautiful-dnd";

type Props = {
  orderedBy: OrderByField[];
  possibleOrderByFields: DataExpression[];
  setOrderBy: (orderBy: OrderByField[]) => void;
  refreshReport: () => Promise<void>;
};

export const OrderBy: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { orderedBy, possibleOrderByFields, setOrderBy, refreshReport } = props;
  const [orderByOpen, setOrderByOpen] = React.useState(false);

  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const buttonText =
    orderedBy.length > 0
      ? `${t("Sorted by:")} ${orderedBy.length} ${
          orderedBy.length === 1 ? t("field") : t("fields")
        }`
      : t("Sort");

  const updateOrderBy = React.useCallback(
    (orderByField: OrderByField, index: number) => {
      const updatedList = [...orderedBy];
      updatedList[index] = orderByField;
      setOrderBy(updatedList);
    },
    [orderedBy, setOrderBy]
  );

  const addOrderBy = React.useCallback(() => {
    const possibleFields =
      getPossibleOrderByFields(
        possibleOrderByFields,
        orderedBy.map(ob => ob.expression)
      ) ?? [];
    setOrderBy([
      ...orderedBy,
      {
        expression: possibleFields[0],
        direction: Direction.Asc,
      },
    ]);
  }, [orderedBy, possibleOrderByFields, setOrderBy]);

  const removeOrderBy = React.useCallback(
    (orderByIndex: number) => {
      const updatedlist = [...orderedBy];
      updatedlist.splice(orderByIndex, 1);
      setOrderBy(updatedlist);
    },
    [orderedBy, setOrderBy]
  );

  const orderByRow = React.useCallback(
    (expressionString: string, index: number) => {
      const orderByField = orderedBy.find(
        o => o.expression.baseExpressionAsQueryLanguage === expressionString
      );
      if (!orderByField) {
        return null;
      }

      return (
        <OrderByRow
          orderByField={orderByField}
          possibleOrderByFields={getPossibleOrderByFields(
            possibleOrderByFields,
            orderedBy.map(ob => ob.expression),
            orderByField.expression
          )}
          updateOrderBy={(orderByField: OrderByField) =>
            updateOrderBy(orderByField, index)
          }
          removeOrderBy={() => removeOrderBy(index)}
          index={index}
          key={index}
        />
      );
    },
    [orderedBy, possibleOrderByFields, removeOrderBy, updateOrderBy]
  );

  return (
    <>
      <Button
        color="inherit"
        startIcon={<SwapVert />}
        size={"large"}
        onClick={() => {
          setOrderByOpen(!orderByOpen);
        }}
        className={classes.actionButton}
        ref={buttonRef}
      >
        {buttonText}
      </Button>
      <Popper
        transition
        open={orderByOpen}
        anchorEl={buttonRef.current}
        placement="bottom-start"
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <div>
              <ClickAwayListener
                mouseEvent="onClick"
                onClickAway={async () => {
                  setOrderByOpen(false);
                  await refreshReport();
                }}
              >
                <div className={classes.orderByFields}>
                  <DragDropContext
                    onDragEnd={(result: DropResult) => {
                      const updatedOrderBy = onDragEnd(result, orderedBy);
                      if (updatedOrderBy) {
                        setOrderBy(updatedOrderBy);
                      }
                    }}
                  >
                    <Droppable
                      droppableId="orderBy"
                      renderClone={(provided, snapshot, rubric) => {
                        const { innerRef } = provided;
                        return (
                          <div
                            {...provided.draggableProps}
                            ref={innerRef}
                            className={classes.draggableRow}
                          >
                            {orderByRow(
                              rubric.draggableId,
                              rubric.source.index
                            )}
                            <div {...provided.dragHandleProps} tabIndex={-1}>
                              <DragHandle />
                            </div>
                          </div>
                        );
                      }}
                    >
                      {(provided, snapshot) => {
                        const { innerRef } = provided;
                        return (
                          <div ref={innerRef} {...provided.droppableProps}>
                            {orderedBy.length > 0 ? (
                              orderedBy.map((o, i) => {
                                return (
                                  <Draggable
                                    key={
                                      o.expression.baseExpressionAsQueryLanguage
                                    }
                                    draggableId={
                                      o.expression.baseExpressionAsQueryLanguage
                                    }
                                    index={i}
                                  >
                                    {(provided, snapshot) => {
                                      const { innerRef } = provided;
                                      return (
                                        <div
                                          ref={innerRef}
                                          {...provided.draggableProps}
                                          className={classes.draggableRow}
                                        >
                                          {orderByRow(
                                            orderedBy[i].expression
                                              .baseExpressionAsQueryLanguage,
                                            i
                                          )}
                                          <div
                                            {...provided.dragHandleProps}
                                            tabIndex={-1}
                                          >
                                            <DragHandle />
                                          </div>
                                        </div>
                                      );
                                    }}
                                  </Draggable>
                                );
                              })
                            ) : (
                              <div className={classes.subText}>
                                {t("No sorts applied")}
                              </div>
                            )}
                            {provided.placeholder}
                          </div>
                        );
                      }}
                    </Droppable>
                  </DragDropContext>

                  <div className={classes.actions}>
                    <Button
                      onClick={addOrderBy}
                      variant="text"
                      className={classes.addOrderBy}
                    >
                      {orderedBy.length === 0
                        ? t("Add a field to sort by")
                        : t("Add another field to sort by")}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={async () => {
                        setOrderByOpen(false);
                        await refreshReport();
                      }}
                    >
                      {t("Apply")}
                    </Button>
                  </div>
                </div>
              </ClickAwayListener>
            </div>
          </Fade>
        )}
      </Popper>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  actionButton: {
    cursor: "pointer",
    minWidth: theme.typography.pxToRem(150),
    background: "rgba(5, 0, 57, 0.6)",
    borderRadius: "4px",
    padding: `${theme.typography.pxToRem(14)} ${theme.typography.pxToRem(24)}`,
    color: "#FFFFFF",
    "&:hover": {
      background: "rgba(5, 0, 57, 0.5)",
    },
  },
  orderByFields: {
    width: theme.typography.pxToRem(600),
    minHeight: theme.typography.pxToRem(100),
    background: theme.palette.background.paper,
    border: "1px solid #E5E5E5",
    boxSizing: "border-box",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
    borderRadius: "4px",
    padding: theme.spacing(2),
  },
  addOrderBy: {
    cursor: "pointer",
    marginTop: theme.spacing(2),
    color: theme.customColors.primary,
    fontWeight: 600,
  },
  subText: {
    color: theme.customColors.edluminSubText,
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  draggableRow: {
    display: "flex",
    alignItems: "center",
  },
}));

const getPossibleOrderByFields = (
  allFields: DataExpression[],
  usedFields: DataExpression[],
  currentField: DataExpression | undefined = undefined
): DataExpression[] => {
  const possibleOrderByFields = allFields.filter(
    f =>
      !usedFields
        .map(uf => uf.baseExpressionAsQueryLanguage)
        .includes(f.baseExpressionAsQueryLanguage) ||
      (currentField &&
        f.baseExpressionAsQueryLanguage ===
          currentField.baseExpressionAsQueryLanguage)
  );
  return possibleOrderByFields;
};

const onDragEnd = (
  result: DropResult,
  orderBy: OrderByField[]
): OrderByField[] | null => {
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

  const orderByBeingMoved = orderBy.find(
    o => o.expression.baseExpressionAsQueryLanguage === draggableId
  );
  if (!orderByBeingMoved) {
    return null;
  }

  const updatedOrderBy = [...orderBy].filter(
    o => o.expression.baseExpressionAsQueryLanguage !== draggableId
  );
  updatedOrderBy.splice(destination.index, 0, orderByBeingMoved);
  return updatedOrderBy;
};

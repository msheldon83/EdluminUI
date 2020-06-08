import * as React from "react";
import { OrderByField, DataExpression, Direction } from "../../types";
import {
  makeStyles,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import { Close, DragHandle } from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import { SelectNew } from "ui/components/form/select-new";
import { Draggable } from "react-beautiful-dnd";

type Props = {
  orderByField: OrderByField;
  possibleOrderByFields: DataExpression[];
  updateOrderBy: (orderByField: OrderByField) => void;
  removeOrderBy: () => void;
  index: number;
};

export const OrderByRow: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    orderByField,
    possibleOrderByFields,
    updateOrderBy,
    removeOrderBy,
    index,
  } = props;

  const orderByOptions = React.useMemo(() => {
    return possibleOrderByFields.map(f => {
      return {
        label: f.displayName,
        value: f.baseExpressionAsQueryLanguage,
      };
    });
  }, [possibleOrderByFields]);

  return (
    <Draggable
      key={orderByField.expression.baseExpressionAsQueryLanguage}
      draggableId={orderByField.expression.baseExpressionAsQueryLanguage}
      index={index}
    >
      {(provided, snapshot) => {
        const { innerRef } = provided;
        return (
          <div
            ref={innerRef}
            {...provided.draggableProps}
            style={{
              ...provided.draggableProps.style,
              position: snapshot.isDragging ? "static" : undefined,
            }}
          >
            <div className={classes.row}>
              <div className={classes.logicalOperator}>
                <div className={classes.removeRow}>
                  <Close
                    className={classes.removeRowIcon}
                    onClick={removeOrderBy}
                  />
                </div>
                <div>{index === 0 ? t("Sort by") : t("then by")}</div>
              </div>
              <div className={`${classes.field} ${classes.rowItem}`}>
                <SelectNew
                  value={
                    orderByOptions.find(
                      o =>
                        o.value ===
                        orderByField.expression.baseExpressionAsQueryLanguage
                    ) ?? { value: "", label: "" }
                  }
                  options={orderByOptions}
                  onChange={v => {
                    const field = possibleOrderByFields.find(
                      o => o.baseExpressionAsQueryLanguage === v.value
                    );
                    if (field) {
                      updateOrderBy({
                        expression: field,
                        direction: Direction.Asc,
                      });
                    }
                  }}
                  multiple={false}
                  withResetValue={false}
                  doSort={false}
                />
              </div>
              <div className={`${classes.direction} ${classes.rowItem}`}>
                <RadioGroup
                  value={orderByField.direction}
                  onChange={e => {
                    updateOrderBy({
                      expression: orderByField.expression,
                      direction:
                        e.target.value === Direction.Asc.toString()
                          ? Direction.Asc
                          : Direction.Desc,
                    });
                  }}
                  aria-label="selection"
                  row
                >
                  <FormControlLabel
                    value={Direction.Asc}
                    control={<Radio />}
                    label={"A > Z"}
                  />
                  <FormControlLabel
                    value={Direction.Desc}
                    control={<Radio />}
                    label={"Z > A"}
                  />
                </RadioGroup>
              </div>
              <div {...provided.dragHandleProps} tabIndex={-1}>
                <DragHandle />
              </div>
            </div>
          </div>
        );
      }}
    </Draggable>
  );
};

const useStyles = makeStyles(theme => ({
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing(),
  },
  rowItem: {
    marginLeft: theme.spacing(),
  },
  logicalOperator: {
    display: "flex",
    alignItems: "center",
    fontWeight: 600,
    width: theme.typography.pxToRem(100),
  },
  removeRow: {
    color: theme.customColors.primary,
    cursor: "pointer",
    width: theme.typography.pxToRem(30),
  },
  removeRowIcon: {
    width: theme.typography.pxToRem(20),
  },
  field: {
    width: theme.typography.pxToRem(250),
  },
  direction: {
    width: theme.typography.pxToRem(170),
    marginLeft: theme.spacing(2),
  },
}));

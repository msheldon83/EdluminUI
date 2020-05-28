import * as React from "react";
import { DataExpression, OrderByField, Direction } from "../../types";
import { useTranslation } from "react-i18next";
import {
  makeStyles,
  Button,
  Popper,
  Fade,
  ClickAwayListener,
} from "@material-ui/core";
import { SwapVert } from "@material-ui/icons";
import { OrderByRow } from "./order-by-row";

type Props = {
  currentOrderByFields: OrderByField[];
  possibleOrderByFields: DataExpression[];
  //setFilters: (filterFields: FilterField[]) => void;
  refreshReport: () => Promise<void>;
};

export const OrderBy: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { currentOrderByFields, possibleOrderByFields, refreshReport } = props;
  const [orderByOpen, setOrderByOpen] = React.useState(false);
  const [localOrderBy, setLocalOrderBy] = React.useState<OrderByField[]>([]);

  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const buttonText =
    localOrderBy.length > 0
      ? `${t("Sorted by:")} ${localOrderBy.length} ${
          localOrderBy.length === 1 ? t("field") : t("fields")
        }`
      : t("Sort");

  // React.useEffect(() => {
  //   const definedFilters = localFilters.filter(f => f.value !== undefined);
  //   //setFilters(definedFilters);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [localFilters]);

  const updateOrderBy = React.useCallback(
    (orderByField: OrderByField, index: number) => {
      const updatedList = [...localOrderBy];
      updatedList[index] = orderByField;
      setLocalOrderBy(updatedList);
    },
    [localOrderBy]
  );

  const addOrderBy = React.useCallback(() => {
    setLocalOrderBy(current => {
      return [
        ...current,
        {
          expression: possibleOrderByFields[0],
          direction: Direction.Asc,
        },
      ];
    });
  }, [possibleOrderByFields]);

  const removeOrderBy = React.useCallback(
    (orderByIndex: number) => {
      const updatedlist = [...localOrderBy];
      updatedlist.splice(orderByIndex, 1);
      setLocalOrderBy(updatedlist);
    },
    [localOrderBy]
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
                  {localOrderBy.length > 0 ? (
                    localOrderBy.map((o, i) => {
                      return (
                        <OrderByRow
                          orderByField={o}
                          possibleOrderByFields={possibleOrderByFields}
                          updateOrderBy={(orderByField: OrderByField) =>
                            updateOrderBy(orderByField, i)
                          }
                          removeOrderBy={() => removeOrderBy(i)}
                          isFirst={i === 0}
                          key={i}
                        />
                      );
                    })
                  ) : (
                    <div className={classes.subText}>
                      {t("No sorts applied")}
                    </div>
                  )}
                  <div>
                    <Button
                      onClick={addOrderBy}
                      variant="text"
                      className={classes.addOrderBy}
                    >
                      {t("Add another field to sort by")}
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
}));

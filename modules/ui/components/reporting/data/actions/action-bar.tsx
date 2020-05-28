import * as React from "react";
import {
  DataSourceField,
  FilterField,
  OrderByField,
  DataExpression,
} from "../../types";
import { makeStyles } from "@material-ui/core";
import { OptionalFilters } from "./optional-filters";
import { RequiredFilters } from "./required-filters";
import { OrderBy } from "./order-by";

type Props = {
  currentFilters: FilterField[];
  filterableFields: DataSourceField[];
  setFilters: (
    filterFields: FilterField[],
    areOptional: boolean,
    refreshReport?: boolean
  ) => void;
  currentOrderByFields: OrderByField[];
  possibleOrderByFields: DataExpression[];
  refreshReport: () => Promise<void>;
};

export const ActionBar: React.FC<Props> = props => {
  const classes = useStyles();
  const {
    currentFilters,
    filterableFields,
    setFilters,
    currentOrderByFields,
    possibleOrderByFields,
    refreshReport,
  } = props;

  return (
    <div className={classes.actionBar}>
      <RequiredFilters
        currentFilters={currentFilters}
        filterableFields={filterableFields.filter(f => f.isRequiredFilter)}
        setFilters={(filterFields: FilterField[]) =>
          setFilters(filterFields, false, true)
        }
      />
      <div className={classes.actionButtons}>
        <OptionalFilters
          currentFilters={currentFilters}
          filterableFields={filterableFields.filter(f => !f.isRequiredFilter)}
          setFilters={(filterFields: FilterField[]) =>
            setFilters(filterFields, true)
          }
          refreshReport={refreshReport}
        />
      </div>
      <div className={classes.actionButtons}>
        <OrderBy
          currentOrderByFields={currentOrderByFields}
          possibleOrderByFields={possibleOrderByFields}
          refreshReport={refreshReport}
        />
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  actionBar: {
    display: "flex",
    alignItems: "flex-end",
  },
  actionButtons: {
    marginLeft: theme.spacing(2),
    height: theme.typography.pxToRem(50),
  },
}));

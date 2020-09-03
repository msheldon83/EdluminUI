import * as React from "react";
import {
  DataSourceField,
  FilterField,
  OrderByField,
  DataExpression,
} from "../../types";
import { makeStyles } from "@material-ui/core";
import { OptionalFilters } from "./filters/optional-filters";
import { RequiredFilters } from "./filters/required-filters";
import { OrderBy } from "./order-by/order-by";
import { AddColumns } from "./columns/add-columns";

type Props = {
  filters: FilterField[];
  filterableFields: DataSourceField[];
  setFilters: (
    filters: FilterField[],
    areRequiredFilters: boolean,
    refreshReport?: boolean
  ) => void;
  orderedBy: OrderByField[];
  possibleOrderByFields: DataExpression[];
  setOrderBy: (orderBy: OrderByField[]) => void;
  columns: DataExpression[];
  allFields: DataSourceField[];
  addColumns: (columns: DataExpression[]) => void;
  refreshReport: () => Promise<void>;
};

export const ActionBar: React.FC<Props> = props => {
  const classes = useStyles();
  const {
    filters,
    filterableFields,
    setFilters,
    orderedBy,
    possibleOrderByFields,
    setOrderBy,
    columns,
    allFields,
    addColumns,
    refreshReport,
  } = props;

  return (
    <div className={classes.actionBar}>
      <RequiredFilters
        filters={filters.filter(f => f.field.isRequiredFilter)}
        filterableFields={filterableFields.filter(f => f.isRequiredFilter)}
        setFilters={(filters: FilterField[]) => setFilters(filters, true, true)}
      />
      <div className={classes.actionButtons}>
        <OptionalFilters
          filters={filters.filter(
            f =>
              !f.field.isRequiredFilter &&
              filterableFields.find(
                ff => f.field.dataSourceFieldName === ff.dataSourceFieldName
              )
          )}
          filterableFields={filterableFields.filter(f => !f.isRequiredFilter)}
          setFilters={(filters: FilterField[]) =>
            setFilters(filters, false, false)
          }
          refreshReport={refreshReport}
        />
      </div>
      <div className={classes.actionButtons}>
        <OrderBy
          orderedBy={orderedBy}
          possibleOrderByFields={possibleOrderByFields}
          setOrderBy={setOrderBy}
          refreshReport={refreshReport}
        />
      </div>
      <div className={classes.actionButtons}>
        <AddColumns
          columns={columns}
          allFields={allFields}
          addColumns={addColumns}
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

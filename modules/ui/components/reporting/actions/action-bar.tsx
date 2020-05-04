import * as React from "react";
import { DataSourceField, FilterField } from "../types";
import { makeStyles } from "@material-ui/core";
import { Filters } from "./filters";

type Props = {
  currentFilters: FilterField[];
  filterableFields: DataSourceField[];
  setFilters: (filterFields: FilterField[]) => void;
  refreshReport: () => Promise<void>;
};

export const ActionBar: React.FC<Props> = props => {
  const classes = useStyles();
  const { currentFilters, filterableFields, setFilters, refreshReport } = props;

  return (
    <div className={classes.actionBar}>
      {/*TODO: Required Filters component here */}
      <Filters
        currentFilters={currentFilters}
        filterableFields={filterableFields.filter(f => !f.isRequiredFilter)}
        setFilters={setFilters}
        refreshReport={refreshReport}
      />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  actionBar: {
    display: "flex",
  },
}));

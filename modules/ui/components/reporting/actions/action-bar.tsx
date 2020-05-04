import * as React from "react";
import { DataSourceField, FilterField } from "../types";
import { makeStyles } from "@material-ui/core";
import { OptionalFilters } from "./optional-filters";
import { RequiredFilters } from "./required-filters";

type Props = {
  currentFilters: FilterField[];
  filterableFields: DataSourceField[];
  setFilters: (filterFields: FilterField[], areOptional: boolean) => void;
  refreshReport: () => Promise<void>;
};

export const ActionBar: React.FC<Props> = props => {
  const classes = useStyles();
  const { currentFilters, filterableFields, setFilters, refreshReport } = props;

  return (
    <div className={classes.actionBar}>
      {/*TODO: Required Filters component here */}
      <RequiredFilters
        currentFilters={currentFilters}
        filterableFields={filterableFields.filter(f => f.isRequiredFilter)}
        setFilters={(filterFields: FilterField[]) =>
          setFilters(filterFields, false)
        }
        refreshReport={refreshReport}
      />
      <OptionalFilters
        currentFilters={currentFilters}
        filterableFields={filterableFields.filter(f => !f.isRequiredFilter)}
        setFilters={(filterFields: FilterField[]) =>
          setFilters(filterFields, true)
        }
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

import * as React from "react";
import { ReportDefinition, DataSourceField, FilterField } from "../types";
import { Grid } from "@material-ui/core";
import { Filters } from "./filters";

type Props = {
  currentFilters: FilterField[];
  filterableFields: DataSourceField[];
  setFilter: (filterField: FilterField) => void;
};

export const ActionBar: React.FC<Props> = props => {
  const { currentFilters, filterableFields, setFilter } = props;

  return (
    <div>
      <Filters
        currentFilters={currentFilters}
        filterableFields={filterableFields}
        setFilter={setFilter}
      />
    </div>
  );
};

// Need a row for required filters
// Need a row for filter button, group by button (later), and Add Column (later)
// Popover for filtering
// Search button to the right, disabled if no pending updates

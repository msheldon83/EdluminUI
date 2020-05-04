import * as React from "react";
import { FilterField, DataSourceField, ExpressionFunction } from "../types";
import { Filter } from "./filter";

type Props = {
  currentFilters: FilterField[];
  filterableFields: DataSourceField[];
  setFilters: (filterFields: FilterField[]) => void;
  refreshReport: () => Promise<void>;
};

export const RequiredFilters: React.FC<Props> = props => {
  //const classes = useStyles();
  const { currentFilters, filterableFields, setFilters, refreshReport } = props;
  const [localFilters, setLocalFilters] = React.useState<FilterField[]>();

  return (
    <>
      {filterableFields.map((f, i) => {
        return (
          <Filter
            filterField={{
              field: f,
              expressionFunction: ExpressionFunction.Equal,
            }}
            updateFilter={() => {}}
            key={i}
          />
        );
      })}
    </>
  );
};

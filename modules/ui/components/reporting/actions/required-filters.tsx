import * as React from "react";
import { FilterField, DataSourceField, ExpressionFunction } from "../types";
import { Filter } from "./filter";

type Props = {
  filterableFields: DataSourceField[];
  setFilters: (filterFields: FilterField[]) => void;
};

export const RequiredFilters: React.FC<Props> = props => {
  //const classes = useStyles();
  const { filterableFields, setFilters } = props;
  const [localFilters, setLocalFilters] = React.useState<FilterField[]>(
    filterableFields.map(f => {
      return {
        field: f,
        expressionFunction:
          f.defaultExpressionFunction ?? ExpressionFunction.Equal,
      };
    })
  );

  React.useEffect(() => {
    const definedFilters = localFilters.filter(f => f.value !== undefined);
    setFilters(definedFilters);
  }, [localFilters]);

  const updateFilter = React.useCallback(
    (filterField: FilterField, filterIndex: number) => {
      const updatedFilters = [...localFilters];
      updatedFilters[filterIndex] = filterField;
      setLocalFilters(updatedFilters);
    },
    [localFilters, setLocalFilters]
  );

  return (
    <>
      {localFilters.map((f, i) => {
        return (
          <Filter
            filterField={f}
            updateFilter={(filterField: FilterField) =>
              updateFilter(filterField, i)
            }
            showLabel={true}
            key={i}
          />
        );
      })}
    </>
  );
};

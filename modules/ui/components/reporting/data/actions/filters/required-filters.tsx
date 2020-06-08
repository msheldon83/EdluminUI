import * as React from "react";
import {
  FilterField,
  DataSourceField,
  ExpressionFunction,
} from "../../../types";
import { Filter } from "./filter";

type Props = {
  filters: FilterField[];
  filterableFields: DataSourceField[];
  setFilters: (filterFields: FilterField[]) => void;
};

export const RequiredFilters: React.FC<Props> = props => {
  const { filters, filterableFields, setFilters } = props;
  const [localFilters, setLocalFilters] = React.useState<FilterField[]>(
    filterableFields.map(f => {
      const matchingCurrentFilter = filters.find(
        c => c.field.dataSourceFieldName === f.dataSourceFieldName
      );

      return {
        field: f,
        expressionFunction:
          matchingCurrentFilter?.expressionFunction ??
          f.defaultExpressionFunction ??
          ExpressionFunction.Equal,
        value: matchingCurrentFilter?.value ?? undefined,
      };
    })
  );

  React.useEffect(() => {
    const definedFilters = localFilters.filter(f => f.value !== undefined);
    setFilters(definedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div>
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
    </div>
  );
};

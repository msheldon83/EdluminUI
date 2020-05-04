import * as React from "react";
import { Checkbox, makeStyles } from "@material-ui/core";
import { FilterField, FilterType, ExpressionFunction } from "../types";
import { PositionTypeSelect } from "ui/components/reference-selects/position-type-select";
import { LocationSelect } from "ui/components/reference-selects/location-select";
import { useOrganizationId } from "core/org-context";

type Props = {
  filterField: FilterField;
  updateFilter: (filterField: FilterField) => void;
};

export const Filter: React.FC<Props> = props => {
  const organizationId = useOrganizationId();
  const { filterField, updateFilter } = props;

  switch (filterField.field.filterType) {
    case FilterType.Boolean:
      return (
        <Checkbox
          checked={filterField.value ?? false}
          onChange={(e, checked) =>
            updateFilter({
              field: filterField.field,
              expressionFunction: ExpressionFunction.Equal,
              value: checked,
            })
          }
          color="primary"
        />
      );
    case FilterType.Custom:
      switch (filterField.field.filterTypeDefinition?.key) {
        case "Location":
          return (
            <LocationSelect
              orgId={organizationId ?? undefined}
              setSelectedLocationIds={locationIds => {
                console.log(locationIds);

                const value = locationIds ?? [];
                updateFilter({
                  field: filterField.field,
                  expressionFunction:
                    value.length > 0
                      ? ExpressionFunction.ContainedIn
                      : ExpressionFunction.Equal,
                  value: value,
                });
              }}
              selectedLocationIds={filterField.value ?? []}
              multiple={
                filterField.expressionFunction ===
                ExpressionFunction.ContainedIn
              }
              includeAllOption={false}
              key={filterField.expressionFunction}
            />
          );
        case "PositionType":
          return (
            <PositionTypeSelect
              orgId={organizationId ?? undefined}
              setSelectedPositionTypeIds={positionTypeIds => {
                const value = positionTypeIds ?? [];
                updateFilter({
                  field: filterField.field,
                  expressionFunction:
                    value.length > 0
                      ? ExpressionFunction.ContainedIn
                      : ExpressionFunction.Equal,
                  value: value,
                });
              }}
              selectedPositionTypeIds={filterField.value ?? []}
              multiple={
                filterField.expressionFunction ===
                ExpressionFunction.ContainedIn
              }
              includeAllOption={false}
              key={filterField.expressionFunction}
            />
          );
        case "Employee":
          //TODO
          break;
        case "Substitute":
          //TODO
          break;
        case "AbsenceReason":
          //TODO
          break;
        case "VacancyReason":
          //TODO
          break;
      }
      break;
  }

  return null;
};

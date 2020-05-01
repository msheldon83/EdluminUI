import * as React from "react";
import { DataSourceField, FilterType } from "../types";
import { FormControlLabel, Checkbox } from "@material-ui/core";
import { LocationSelect } from "ui/components/reference-selects/location-select";
import { PositionTypeSelect } from "ui/components/reference-selects/position-type-select";

type Props = {
  filterFields: {
    field: DataSourceField;
    value?: any;
  }[];
  setFilterValue: (field: DataSourceField, value: any) => void;
};

export const Filters: React.FC<Props> = props => {
  const { filterFields, setFilterValue } = props;
  console.log("filterFields", filterFields);

  let filters: JSX.Element[] = [];
  filterFields.forEach(ff => {
    switch (ff.field.filterType) {
      case FilterType.Boolean:
        filters.push(
          <FormControlLabel
            checked={ff.value ?? false}
            control={
              <Checkbox
                onChange={(e, checked) => setFilterValue(ff.field, checked)}
                color="primary"
              />
            }
            label={ff.field.friendlyName}
          />
        );
        break;
      case FilterType.Custom:
        (ff.field.filterTypeDefinition ?? []).map(ft => {
          switch (ft.key) {
            case "Location":
              filters.push(
                <LocationSelect
                  orgId={"1038"}
                  setSelectedLocationIds={() => {}}
                  multiple={true}
                  label={ff.field.friendlyName}
                  includeAllOption={true}
                />
              );
              break;
            case "PositionType":
              filters.push(
                <PositionTypeSelect
                  orgId={"1038"}
                  setSelectedPositionTypeIds={() => {}}
                  multiple={true}
                  label={ff.field.friendlyName}
                  includeAllOption={true}
                />
              );
              break;
          }
        });
        break;
    }
  });

  if (filters.length === 0) {
    return null;
  }

  return (
    <>
      {filters.map((f, i) => {
        return <React.Fragment key={i}>{f}</React.Fragment>;
      })}
    </>
  );
};

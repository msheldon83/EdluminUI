import * as React from "react";
import { ReportDefinition } from "../types";
import { Grid } from "@material-ui/core";

type Props = {
  reportDefinition: ReportDefinition;
  filterFieldsOverride?: string[];
};

export const FilterBar: React.FC<Props> = props => {
  const { reportDefinition, filterFieldsOverride = [] } = props;

  const allFields = reportDefinition.metadata.query.schema.allFields;
  let filterableFields = allFields.filter(f => !!f.filterType);

  // If we have filterKeysOverride, then filter the list down to the matching ones
  if (filterFieldsOverride.length > 0) {
    filterableFields = filterableFields.filter(f =>
      filterFieldsOverride.includes(f.dataSourceFieldName)
    );
  }

  return (
    <div>
      <Grid container>
        {filterableFields.map(f => {
          return <Grid item>{f.friendlyName}</Grid>;
        })}
      </Grid>
    </div>
  );
};

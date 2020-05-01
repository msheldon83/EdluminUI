import * as React from "react";
import { ReportDefinition, DataSourceField } from "../types";
import { Grid } from "@material-ui/core";
import { Filters } from "./filters";

type Props = {
  filterFields: {
    field: DataSourceField;
    value?: any;
  }[];
  setFilterValue: (field: DataSourceField, value: any) => void;
};

export const ActionBar: React.FC<Props> = props => {
  const { filterFields, setFilterValue } = props;

  return (
    <div>
      <Grid container>
        <Filters filterFields={filterFields} setFilterValue={setFilterValue} />
      </Grid>
    </div>
  );
};

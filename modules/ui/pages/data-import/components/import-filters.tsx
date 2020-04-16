import * as React from "react";
import { DataImportStatus, DataImportType } from "graphql/server-types.gen";
import { ImportStatusFilter } from "./import-status-filter";
import { ImportTypeFilter } from "./import-type-filter";
import { makeStyles, Grid } from "@material-ui/core";

type Props = {
  selectedStatusId?: DataImportStatus;
  setSelectedStatusId: (statusId?: DataImportStatus) => void;
  selectedTypeId?: DataImportType;
  setSelectedTypeId: (typeId?: DataImportType) => void;
};

export const ImportFilters: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <ImportStatusFilter
          selectedStatusId={props.selectedStatusId}
          setSelectedStatusId={props.setSelectedStatusId}
        />
      </Grid>
      <Grid item xs={3}>
        <ImportTypeFilter
          selectedTypeId={props.selectedTypeId}
          setSelectedTypeId={props.setSelectedTypeId}
        />
      </Grid>
    </Grid>
  );
};

export const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    alignItems: "center",
  },
}));

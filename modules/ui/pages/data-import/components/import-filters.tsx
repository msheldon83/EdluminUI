import * as React from "react";
import { useTranslation } from "react-i18next";
import { DataImportStatus, DataImportType } from "graphql/server-types.gen";
import { ImportStatusFilter } from "./import-status-filter";
import { ImportTypeFilter } from "ui/components/data-import/import-type-filter";
import { makeStyles, Grid, InputLabel } from "@material-ui/core";
import { DatePicker } from "ui/components/form/date-picker";

type Props = {
  selectedStatusId?: DataImportStatus;
  setSelectedStatusId: (statusId?: DataImportStatus) => void;
  selectedTypeId?: DataImportType;
  setSelectedTypeId: (typeId?: DataImportType) => void;
  fromDate: Date | string;
  setFromDate: (date: Date | string) => void;
  toDate: Date | string;
  setToDate: (date: Date | string) => void;
};

export const ImportFilters: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Grid container spacing={2}>
      <Grid item xs={2}>
        <InputLabel className={classes.label}>{t("From")}</InputLabel>
        <DatePicker
          variant={"single-hidden"}
          startDate={props.fromDate}
          onChange={({ startDate }) => props.setFromDate(startDate)}
        />
      </Grid>
      <Grid item xs={2}>
        <InputLabel className={classes.label}>{t("To")}</InputLabel>
        <DatePicker
          variant={"single-hidden"}
          startDate={props.toDate}
          onChange={({ startDate }) => props.setToDate(startDate)}
        />
      </Grid>
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
  label: {
    marginBottom: theme.spacing(0.4),
  },
}));

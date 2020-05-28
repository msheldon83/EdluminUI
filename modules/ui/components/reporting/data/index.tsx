import * as React from "react";
import {
  ReportDefinition,
  FilterField,
  DataSourceField,
  SelectField,
  Direction,
  OrderByField,
} from "../types";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";
import { LoadingDataGrid } from "./loading-data-grid";
import { ActionBar } from "./actions/action-bar";
import { TextButton } from "ui/components/text-button";
import { DataGrid } from "./data-grid";

type Props = {
  reportDefinition: ReportDefinition | undefined;
  inputSelects: SelectField[];
  isLoading: boolean;
  currentFilters: FilterField[];
  filterableFields: DataSourceField[];
  setFilters: (
    filterFields: FilterField[],
    areOptional: boolean,
    refreshReport?: boolean
  ) => void;
  currentOrderByFields: OrderByField[];
  setOrderBy: (columnIndex: number, direction: Direction) => Promise<void>;
  refreshReport: () => Promise<void>;
  exportReport?: () => Promise<void>;
  showGroupLabels?: boolean;
};

export const ReportData: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const {
    reportDefinition,
    isLoading,
    currentFilters,
    filterableFields,
    setFilters,
    currentOrderByFields,
    setOrderBy,
    refreshReport,
    exportReport,
    showGroupLabels = true,
    inputSelects = [],
  } = props;

  return !reportDefinition ? (
    <div className={classes.gridWrapper}>
      <LoadingDataGrid />
    </div>
  ) : (
    <>
      <div className={classes.actions}>
        <ActionBar
          filterableFields={filterableFields}
          setFilters={setFilters}
          refreshReport={refreshReport}
          currentFilters={currentFilters}
          currentOrderByFields={currentOrderByFields}
          possibleOrderByFields={reportDefinition.metadata.query.selects}
        />
        {exportReport && (
          <TextButton onClick={exportReport}>{t("Export Report")}</TextButton>
        )}
      </div>
      <div className={classes.gridWrapper}>
        <DataGrid
          reportDefinition={reportDefinition}
          isLoading={isLoading}
          showGroupLabels={showGroupLabels}
          inputSelects={inputSelects}
          setOrderBy={setOrderBy}
        />
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  actions: {
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(3),
    borderTopWidth: theme.typography.pxToRem(1),
    borderLeftWidth: theme.typography.pxToRem(1),
    borderRightWidth: theme.typography.pxToRem(1),
    borderBottomWidth: 0,
    borderColor: theme.customColors.sectionBorder,
    borderStyle: "solid",
    borderTopLeftRadius: "0.25rem",
    borderTopRightRadius: "0.25rem",
    backgroundColor: theme.customColors.white,
  },
  gridWrapper: {
    width: "100%",
    height: "100%",
    padding: theme.spacing(3),
    borderTopWidth: 0,
    borderBottomWidth: theme.typography.pxToRem(1),
    borderLeftWidth: theme.typography.pxToRem(1),
    borderRightWidth: theme.typography.pxToRem(1),
    borderColor: theme.customColors.sectionBorder,
    borderStyle: "solid",
    borderBottomLeftRadius: "0.25rem",
    borderBottomRightRadius: "0.25rem",
    backgroundColor: theme.customColors.white,
  },
}));

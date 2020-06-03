import * as React from "react";
import {
  FilterField,
  DataSourceField,
  Report,
  Direction,
  ReportDefinitionData,
} from "../types";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";
import { LoadingDataGrid } from "./loading-data-grid";
import { ActionBar } from "./actions/action-bar";
import { TextButton } from "ui/components/text-button";
import { DataGrid } from "./data-grid";

type Props = {
  report: Report | undefined;
  reportData: ReportDefinitionData | undefined;
  isLoading: boolean;
  filterableFields: DataSourceField[];
  setFilters: (
    filters: FilterField[],
    areRequiredFilters: boolean,
    refreshReport?: boolean
  ) => void;
  setOrderBy: (columnIndex: number, direction: Direction) => Promise<void>;
  refreshReport: () => Promise<void>;
  exportReport?: () => Promise<void>;
  showGroupLabels?: boolean;
};

export const ReportData: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const {
    report,
    reportData,
    isLoading,
    filterableFields,
    setFilters,
    setOrderBy,
    refreshReport,
    exportReport,
    showGroupLabels = true,
  } = props;

  return !report ? (
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
          filters={report.filters ?? []}
          currentOrderByFields={report.orderBy ?? []}
          possibleOrderByFields={report.selects}
        />
        {exportReport && (
          <TextButton onClick={exportReport}>{t("Export Report")}</TextButton>
        )}
      </div>
      <div className={classes.gridWrapper}>
        {reportData && (
          <DataGrid
            report={report}
            reportData={reportData}
            isLoading={isLoading}
            showGroupLabels={showGroupLabels}
            setOrderBy={setOrderBy}
          />
        )}
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

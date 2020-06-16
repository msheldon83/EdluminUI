import * as React from "react";
import {
  FilterField,
  DataSourceField,
  Report,
  Direction,
  ReportDefinitionData,
  DataExpression,
  OrderByField,
} from "../types";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";
import { LoadingDataGrid } from "./loading-data-grid";
import { ActionBar } from "./actions";
import { TextButton } from "ui/components/text-button";
import { DataGrid } from "./data-grid";
import { compact } from "lodash-es";

type Props = {
  report: Report | undefined;
  reportData: ReportDefinitionData | undefined;
  isLoading: boolean;
  allFields: DataSourceField[];
  addColumns: (
    columns: DataExpression[],
    index?: number,
    addBeforeIndex?: boolean
  ) => void;
  setColumns: (columns: DataExpression[]) => void;
  removeColumn: (index: number) => void;
  filterableFields: DataSourceField[];
  setFilters: (
    filters: FilterField[],
    areRequiredFilters: boolean,
    refreshReport?: boolean
  ) => void;
  setOrderBy: (orderBy: OrderByField[]) => void;
  setFirstLevelOrderBy: (
    expression: DataExpression,
    direction: Direction
  ) => void;
  refreshReport: () => Promise<void>;
  exportReport?: () => Promise<void>;
  showGroupLabels?: boolean;
  sumRowData?: boolean;
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
    setFirstLevelOrderBy,
    allFields,
    addColumns,
    setColumns,
    removeColumn,
    refreshReport,
    exportReport,
    showGroupLabels = true,
    sumRowData = true,
  } = props;

  const possibleOrderByFields = React.useMemo(() => {
    const fields = report?.selects ?? [];
    const subtotalDisplayFields = compact(
      (report?.subtotalBy ?? []).map(s => {
        const subtotalExpression = s.showExpression
          ? s.showExpression
          : s.expression;
        const match = fields.find(
          f =>
            f.baseExpressionAsQueryLanguage ===
            subtotalExpression.baseExpressionAsQueryLanguage
        );
        return match ? null : subtotalExpression;
      })
    );
    return [...subtotalDisplayFields, ...fields];
  }, [report?.selects, report?.subtotalBy]);

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
          setOrderBy={setOrderBy}
          orderedBy={report.orderBy ?? []}
          possibleOrderByFields={possibleOrderByFields}
          columns={report.selects}
          allFields={allFields}
          addColumns={addColumns}
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
            setFirstLevelOrderBy={setFirstLevelOrderBy}
            orderedBy={report.orderBy ?? []}
            sumRowData={sumRowData}
            allFields={allFields}
            addColumns={addColumns}
            setColumns={setColumns}
            removeColumn={removeColumn}
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

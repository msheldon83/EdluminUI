import * as React from "react";
import { AppConfig } from "hooks/app-config";
import { Direction, FilterField, DataExpression, OrderByField } from "./types";
import { useQueryBundle, useImperativeQuery } from "graphql/hooks";
import { GetReportDataQuery, GetReportChartQuery } from "./graphql/get-report";
import { reportReducer } from "./state";
import { makeStyles } from "@material-ui/core";
import { useOrganizationId } from "core/org-context";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowNetworkErrors } from "../error-helpers";
import { ExportReportQuery } from "./graphql/export-report";
import { useTranslation } from "react-i18next";
import { ReportData } from "./data";
import { ReportChart } from "./chart";
import { PageTitle } from "../page-title";
import { InsertChart } from "@material-ui/icons";
import { TextButton } from "../text-button";

type Props = {
  title: string;
  rdl: string;
  exportFilename?: string;
  allowedFilterFieldsOverride?: string[];
  baseFilterFieldNames?: string[];
  showGroupLabels?: boolean;
};

export const Report: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const organizationId = useOrganizationId();
  const {
    title,
    rdl,
    allowedFilterFieldsOverride,
    baseFilterFieldNames,
    exportFilename = t("Report"),
    showGroupLabels = true,
  } = props;

  const [chartVisible, setChartVisible] = React.useState(true);
  const [state, dispatch] = React.useReducer(reportReducer, {
    rdlString: rdl,
    filterableFields: [],
    baseFilterFieldNames,
  });

  // Load the report data
  const reportDataResponse = useQueryBundle(GetReportDataQuery, {
    variables: {
      input: {
        orgIds: [organizationId],
        queryText: state.rdlString,
      },
    },
    onError: error => {
      ShowNetworkErrors(error, openSnackbar);
    },
  });

  React.useEffect(() => {
    if (reportDataResponse.state === "DONE") {
      dispatch({
        action: "processReportDefinition",
        reportDefinition: reportDataResponse.data.report,
        allowedFilterFieldsOverride,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportDataResponse.state, state.report]);

  // Load the report chart
  const reportChartResponse = useQueryBundle(GetReportChartQuery, {
    variables: {
      input: {
        orgIds: [organizationId],
        queryText: state.rdlChartString,
      },
    },
    skip: !state.rdlChartString,
    onError: error => {
      ShowNetworkErrors(error, openSnackbar);
    },
  });

  React.useEffect(() => {
    if (reportChartResponse.state === "DONE") {
      dispatch({
        action: "setReportChartDefinition",
        reportChartDefinition: reportChartResponse.data.report,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportChartResponse.state]);

  // Support Exporting to CSV
  const downloadCsvFile = useImperativeQuery(ExportReportQuery, {
    onError: error => {
      ShowNetworkErrors(error, openSnackbar);
    },
  });

  const setFilters = React.useCallback(
    (
      filters: FilterField[],
      areRequiredFilters: boolean,
      refreshReport?: boolean
    ) => {
      dispatch({
        action: "setFilters",
        filters: filters,
        areRequiredFilters,
        refreshReport,
      });
    },
    []
  );

  const refreshReport = React.useCallback(async () => {
    dispatch({ action: "refreshReport" });
  }, []);

  const setOrderBy = React.useCallback((orderBy: OrderByField[]) => {
    dispatch({ action: "setOrderBy", orderBy });
  }, []);

  const addOrUpdateOrderBy = React.useCallback(
    (expression: DataExpression, direction: Direction) => {
      dispatch({ action: "addOrUpdateOrderBy", expression, direction });
    },
    []
  );

  return (
    <AppConfig contentWidth="100%">
      <div className={classes.header}>
        <PageTitle title={title} />
        {state.rdlChartString && (
          <TextButton
            startIcon={<InsertChart />}
            onClick={() => setChartVisible(!chartVisible)}
            className={classes.hideChartButton}
          >
            {chartVisible ? t("Hide chart") : t("Show chart")}
          </TextButton>
        )}
      </div>
      {state.rdlChartString && chartVisible && (
        <ReportChart
          reportChartDefinition={state.reportChartDefinition}
          isLoading={
            reportChartResponse.state === "LOADING" ||
            reportChartResponse.state === "UPDATING"
          }
        />
      )}
      <ReportData
        report={state.report}
        reportData={state.reportDefinition?.data}
        isLoading={
          reportDataResponse.state === "LOADING" ||
          reportDataResponse.state === "UPDATING"
        }
        filterableFields={state.filterableFields}
        setFilters={setFilters}
        setOrderBy={setOrderBy}
        addOrUpdateOrderBy={addOrUpdateOrderBy}
        refreshReport={refreshReport}
        exportReport={async () => {
          await downloadCsvFile({
            input: {
              orgIds: [organizationId],
              queryText: state.rdlString,
            },
            filename: exportFilename,
          });
        }}
        showGroupLabels={showGroupLabels}
      />
    </AppConfig>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    display: "flex",
    justifyContent: "space-between",
  },
  hideChartButton: {
    color: "initial",
    fontWeight: 600,
    textDecoration: "none",
    textTransform: "uppercase",
  },
}));

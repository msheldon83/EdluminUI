import * as React from "react";
import { AppConfig } from "hooks/app-config";
import { ReportDefinitionInput, FilterField } from "./types";
import { useQueryBundle, useImperativeQuery } from "graphql/hooks";
import { GetReportDataQuery, GetReportChartQuery } from "./graphql/get-report";
import {
  reportReducer,
  convertReportDefinitionInputToRdl,
  convertReportDefinitionInputToRdlForChart,
} from "./state";
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
  input: ReportDefinitionInput;
  exportFilename?: string;
  filterFieldsOverride?: string[];
  showGroupLabels?: boolean;
};

export const Report: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const organizationId = useOrganizationId();
  const {
    title,
    input,
    filterFieldsOverride,
    exportFilename = t("Report"),
    showGroupLabels = true,
  } = props;

  const [chartVisible, setChartVisible] = React.useState(true);
  const [state, dispatch] = React.useReducer(reportReducer, {
    reportDefinitionInput: input,
    rdlString: convertReportDefinitionInputToRdl(input),
    rdlChartString: convertReportDefinitionInputToRdlForChart(input),
    filters: {
      optional: [],
      required: [],
    },
    filterableFields: [],
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
        action: "setReportDefinition",
        reportDefinition: reportDataResponse.data.report,
        filterFieldsOverride,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportDataResponse.state]);

  // Load the report chart
  const reportChartResponse = useQueryBundle(GetReportChartQuery, {
    variables: {
      input: {
        orgIds: [organizationId],
        queryText: state.rdlChartString,
      },
    },
    skip: !input.chart,
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
      filterFields: FilterField[],
      areOptional: boolean,
      refreshReport?: boolean
    ) => {
      if (areOptional) {
        dispatch({
          action: "setOptionalFilters",
          filters: filterFields,
          refreshReport,
        });
      } else {
        dispatch({
          action: "setRequiredFilters",
          filters: filterFields,
          refreshReport,
        });
      }
    },
    []
  );

  const refreshReport = React.useCallback(async () => {
    dispatch({ action: "refreshReport" });
  }, []);

  return (
    <AppConfig contentWidth="100%">
      <div className={classes.header}>
        <PageTitle title={title} />
        {input.chart && (
          <TextButton
            startIcon={<InsertChart />}
            onClick={() => setChartVisible(!chartVisible)}
            className={classes.hideChartButton}
          >
            {chartVisible ? t("Hide chart") : t("Show chart")}
          </TextButton>
        )}
      </div>
      {input.chart && chartVisible && (
        <ReportChart
          reportChartDefinition={state.reportChartDefinition}
          isLoading={
            reportChartResponse.state === "LOADING" ||
            reportChartResponse.state === "UPDATING"
          }
        />
      )}
      <ReportData
        reportDefinition={state.reportDefinition}
        inputSelects={state.reportDefinitionInput.select}
        isLoading={
          reportDataResponse.state === "LOADING" ||
          reportDataResponse.state === "UPDATING"
        }
        currentFilters={[...state.filters.required, ...state.filters.optional]}
        filterableFields={state.filterableFields}
        setFilters={setFilters}
        refreshReport={refreshReport}
        exportReport={async () => {
          await downloadCsvFile({
            input: {
              orgIds: [organizationId],
              queryText: convertReportDefinitionInputToRdl(
                state.reportDefinitionInput,
                true
              ),
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

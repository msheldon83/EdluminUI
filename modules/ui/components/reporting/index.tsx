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

type Props = {
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
    input,
    filterFieldsOverride,
    exportFilename = t("Report"),
    showGroupLabels = true,
  } = props;

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
      {input.chart && (
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

const useStyles = makeStyles(theme => ({}));

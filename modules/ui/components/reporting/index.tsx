import * as React from "react";
import { AppConfig } from "hooks/app-config";
import { ReportDefinitionInput, FilterField } from "./types";
import { DataGrid } from "./data/data-grid";
import { useQueryBundle } from "graphql/hooks";
import { GetReportQuery } from "./graphql/get-report";
import { LoadingDataGrid } from "./data/loading-data-grid";
import { reportReducer, convertReportDefinitionInputToRdl } from "./state";
import { ActionBar } from "./actions/action-bar";
import { makeStyles } from "@material-ui/core";
import { useOrganizationId } from "core/org-context";

type Props = {
  input: ReportDefinitionInput;
  filterFieldsOverride?: string[];
};

export const Report: React.FC<Props> = props => {
  const classes = useStyles();
  const { input, filterFieldsOverride } = props;
  const organizationId = useOrganizationId();
  const [state, dispatch] = React.useReducer(reportReducer, {
    reportDefinitionInput: input,
    rdlString: convertReportDefinitionInputToRdl(input),
    filters: {
      optional: [],
      required: [],
    },
    filterableFields: [],
  });

  // Load the report
  const reportResponse = useQueryBundle(GetReportQuery, {
    variables: {
      input: {
        orgIds: [organizationId],
        queryText: state.rdlString,
      },
    },
    onError: error => {
      console.error(error);
      //ShowErrors(error, openSnackbar); // TODO: Parse error codes into better messages
    },
  });

  React.useEffect(() => {
    if (reportResponse.state === "DONE") {
      dispatch({
        action: "setReportDefinition",
        reportDefinition: reportResponse.data.report,
        filterFieldsOverride,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportResponse.state]);

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
      <div className={classes.content}>
        {!state.reportDefinition ? (
          <LoadingDataGrid
            numberOfColumns={state.reportDefinitionInput.select.length}
          />
        ) : (
          <>
            <div className={classes.actions}>
              <ActionBar
                filterableFields={state.filterableFields}
                setFilters={setFilters}
                refreshReport={refreshReport}
                currentFilters={[
                  ...state.filters.required,
                  ...state.filters.optional,
                ]}
              />
            </div>
            <DataGrid
              reportDefinition={state.reportDefinition}
              isLoading={
                reportResponse.state === "LOADING" ||
                reportResponse.state === "UPDATING"
              }
            />
          </>
        )}
      </div>
    </AppConfig>
  );
};

const useStyles = makeStyles(theme => ({
  content: {
    width: "100%",
    height: "100%",
    padding: theme.spacing(3),
    borderWidth: theme.typography.pxToRem(1),
    borderColor: theme.customColors.sectionBorder,
    borderStyle: "solid",
    borderRadius: "0.25rem",
    backgroundColor: theme.customColors.white,
  },
  actions: {
    marginBottom: theme.spacing(2),
  },
}));

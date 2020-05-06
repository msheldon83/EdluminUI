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
import { useSnackbar } from "hooks/use-snackbar";
import { ShowNetworkErrors } from "../error-helpers";

type Props = {
  input: ReportDefinitionInput;
  filterFieldsOverride?: string[];
};

export const Report: React.FC<Props> = props => {
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
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
      ShowNetworkErrors(error, openSnackbar);
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
      {!state.reportDefinition ? (
        <div className={classes.gridWrapper}>
          <LoadingDataGrid
            numberOfColumns={state.reportDefinitionInput.select.length}
          />
        </div>
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
          <div className={classes.gridWrapper}>
            <DataGrid
              reportDefinition={state.reportDefinition}
              isLoading={
                reportResponse.state === "LOADING" ||
                reportResponse.state === "UPDATING"
              }
            />
          </div>
        </>
      )}
    </AppConfig>
  );
};

const useStyles = makeStyles(theme => ({
  actions: {
    padding: theme.spacing(3),
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
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(3),
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

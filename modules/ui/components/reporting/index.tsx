import * as React from "react";
import { AppConfig } from "hooks/app-config";
import {
  ReportDefinitionInput,
  Direction,
  OrderByField,
  FilterField,
} from "./types";
import { DataGrid } from "./data/data-grid";
import { useQueryBundle } from "graphql/hooks";
import { GetReportQuery } from "./graphql/get-report";
import { LoadingDataGrid } from "./data/loading-data-grid";
import { reportReducer } from "./state";
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
    currentFilters: [],
    filterableFields: [],
    pendingUpdates: false,
  });

  // Load the report
  const reportResponse = useQueryBundle(GetReportQuery, {
    variables: {
      input: {
        orgIds: [organizationId],
        queryText: convertReportDefinitionInputToRdl(input),
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
  }, [reportResponse.state]);

  const setFilters = React.useCallback(
    (filterFields: FilterField[]) => {
      dispatch({ action: "setFilters", filters: filterFields });
    },
    [dispatch]
  );

  const setOrderBy = React.useCallback(
    (field: OrderByField) => {
      dispatch({ action: "setOrderBy", field });
    },
    [dispatch]
  );

  return (
    <AppConfig contentWidth="100%">
      <div className={classes.content}>
        {!state.reportDefinition ? (
          <LoadingDataGrid />
        ) : (
          <>
            <div className={classes.actions}>
              <ActionBar
                currentFilters={state.currentFilters}
                filterableFields={state.filterableFields}
                setFilters={setFilters}
                refreshReport={async () => {}}
              />
            </div>
            <DataGrid
              reportDefinition={state.reportDefinition}
              setOrderBy={setOrderBy}
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

const convertReportDefinitionInputToRdl = (
  input: ReportDefinitionInput
): string => {
  const rdlPieces: string[] = [];
  rdlPieces.push(`QUERY FROM ${input.from}`);
  if (input.filter && input.filter.length > 0) {
    rdlPieces.push(`WHERE ${input.filter.join(", ")}`);
  }
  rdlPieces.push(`SELECT ${input.select.join(", ")}`);
  if (input.orderBy && input.orderBy.length > 0) {
    rdlPieces.push(
      `ORDER BY ${input.orderBy
        .map(
          o =>
            `${o.expression} ${o.direction === Direction.Asc ? "ASC" : "DESC"}`
        )
        .join(", ")}`
    );
  }
  const rdlString = rdlPieces.join(" ");
  return rdlString;
};

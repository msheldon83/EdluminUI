import * as React from "react";
import { AppConfig } from "hooks/app-config";
import { ReportDefinitionInput, Direction, OrderByField, DataSourceField } from "./types";
import { DataGrid } from "./data/data-grid";
import { useQueryBundle } from "graphql/hooks";
import { GetReportQuery } from "./graphql/get-report";
import { LoadingDataGrid } from "./data/loading-data-grid";
import { reportReducer } from "./state";
import { ActionBar } from "./actions/action-bar";

type Props = {
  input: ReportDefinitionInput;
  orgIds: string[];
  filterFieldsOverride?: string[];
};

export const Report: React.FC<Props> = props => {
  const { input, orgIds, filterFieldsOverride } = props;
  const [state, dispatch] = React.useReducer(reportReducer, { filters: [] });

  // Load the report
  const reportResponse = useQueryBundle(GetReportQuery, {
    variables: {
      input: {
        orgIds,
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
        filterFieldsOverride
      });
    }
  }, [reportResponse.state]);

  const setFilterValue = React.useCallback(
    (field: DataSourceField, value: any) => {
      dispatch({ action: "setFilter", field, value });
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
      {!state.reportDefinition ? (
        <LoadingDataGrid />
      ) : (
        <>
          <ActionBar
            filterFields={state.filters} 
            setFilterValue={setFilterValue}
          />
          <DataGrid
            reportDefinition={state.reportDefinition}
            setOrderBy={setOrderBy}
          />
        </>
      )}
    </AppConfig>
  );
};

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

import * as React from "react";
import { AppConfig } from "hooks/app-config";
import { ReportDefinition, ReportDefinitionInput, Direction } from "./types";
import { DataGrid } from "./data/data-grid";
import { useQueryBundle } from "graphql/hooks";
import { GetReportQuery } from "./graphql/get-report";
import { LoadingDataGrid } from "./data/loading-data-grid";
import { FilterBar } from "./filters/filter-bar";

type Props = {
  input: ReportDefinitionInput;
  orgIds: string[];
  filterFieldsOverride?: string[];
};

export const Report: React.FC<Props> = props => {
  const [report, setReport] = React.useState<ReportDefinition>();
  const { input, orgIds, filterFieldsOverride } = props;

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
      setReport(reportResponse.data.report);
    }
  }, [reportResponse.state]);

  return (
    <AppConfig contentWidth="100%">
      {!report ? (
        <LoadingDataGrid />
      ) : (
        <>
          <FilterBar
            reportDefinition={report}
            filterFieldsOverride={filterFieldsOverride}
          />
          <DataGrid reportDefinition={report} />
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

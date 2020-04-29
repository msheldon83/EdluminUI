import * as React from "react";
import { AppConfig } from "hooks/app-config";
import { ReportDefinition } from "./types";
import { DataGrid } from "./data/data-grid";
import { useQueryBundle } from "graphql/hooks";
import { GetReportQuery } from "./graphql/get-report";

type Props = {
  rdl: string;
  orgIds: string[];
};

export const Report: React.FC<Props> = props => {
  const [report, setReport] = React.useState<ReportDefinition>();
  const { rdl, orgIds } = props;

  // Load the report
  const reportResponse = useQueryBundle(GetReportQuery, {
    variables: {
      input: {
        orgIds,
        queryText: rdl,
      },
    },
    onError: error => {
      console.error(error);
      //ShowErrors(error, openSnackbar); // TODO: Parse error codes into better messages
    },
  });

  console.log(reportResponse);

  if (!report) {
    return <></>;
  }

  return (
    <AppConfig contentWidth="100%">
      <DataGrid reportDefinition={report} />
    </AppConfig>
  );
};

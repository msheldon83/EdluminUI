import gql from "graphql-tag";

export type ReportQueryInput = {
  orgIds: string[];
  queryText: string;
};

export const ExportReportDocument = gql`
  query ExportReport($input: ReportQueryInput!, $filename: string!) {
    report(input: $input, filename: $filename)
      @rest(
        type: "ReportExport"
        path: "/csv?filenameRoot={args.filename}"
        method: "POST"
        endpoint: "reportExport"
      ) {
      report
    }
  }
`;

export const ExportReportQuery = {
  _variables: null as any,
  _result: null as any,
  Document: ExportReportDocument,
};

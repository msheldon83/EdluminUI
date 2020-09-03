import gql from "graphql-tag";

export type ReportQueryInput = {
  orgIds: string[];
  queryText: string;
};

export const GetReportDataDocument = gql`
  query GetReportData($input: ReportQueryInput!) {
    report(input: $input)
      @rest(type: "Report", path: "api/report/run", method: "POST") {
      data
      metadata
    }
  }
`;

export const GetReportDataQuery = {
  _variables: null as any,
  _result: null as any,
  Document: GetReportDataDocument,
};

export const GetReportChartDocument = gql`
  query GetReportChart($input: ReportQueryInput!) {
    report(input: $input)
      @rest(type: "Report", path: "api/report/chart", method: "POST") {
      data
      metadata
    }
  }
`;

export const GetReportChartQuery = {
  _variables: null as any,
  _result: null as any,
  Document: GetReportChartDocument,
};

import gql from "graphql-tag";

export type ReportQueryInput = {
  orgIds: string[];
  queryText: string;
};

export const GetReportDocument = gql`
  query GetReport($input: ReportQueryInput!) {
    getReport(input: $input)
      @rest(type: "GetReport", path: "/report/run", method: "POST") {
      data
    }
  }
`;

export const GetReportQuery = {
  _variables: null as any,
  _result: null as any,
  Document: GetReportDocument,
};

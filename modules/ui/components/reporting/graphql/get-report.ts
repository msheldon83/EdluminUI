import gql from "graphql-tag";

export type ReportQueryInput = {
  orgIds: string[];
  queryText: string;
};

export const GetReportDocument = gql`
  query GetReport($input: ReportQueryInput!) {
    report(input: $input)
      @rest(type: "Report", path: "/report/run", method: "POST") {
      data
      metadata
    }
  }
`;

export const GetReportQuery = {
  _variables: null as any,
  _result: null as any,
  Document: GetReportDocument,
};

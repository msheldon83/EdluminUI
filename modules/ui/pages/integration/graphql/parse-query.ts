import gql from "graphql-tag";

export const ParseQuery = gql`
  query ParseQuery($queryText: string) {
    query(input: $queryText)
      @rest(type: "Query", path: "api/report/parse/query", method: "POST") {
      selects
      filters
      orderBy
      subtotalBy
      schema
    }
  }
`;

export const ParseQueryQuery = {
  _variables: null as any,
  _result: null as any,
  Document: ParseQuery,
};

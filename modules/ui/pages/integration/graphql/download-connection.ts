import gql from "graphql-tag";

export const DownloadConnection = gql`
  query DownloadConnection($filters: [String], $connectionId: Int) {
    query(connectionId: $connectionId, input: $filters)
      @rest(
        type: "Query"
        path: "internalapi/connection/{args.connectionId}/download"
        method: "POST"
        endpoint: "connectionDownload"
      )
  }
`;

export const DownloadConnectionQuery = {
  _variables: null as any,
  _result: null as any,
  Document: DownloadConnection,
};

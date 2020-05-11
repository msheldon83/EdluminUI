import gql from "graphql-tag";

// This is not required by the backend, but Apollo-link-rest needs an input body
export type FailedDownLoadInput = {
  orgId: string;
};

export const DownloadFailedRowsDocument = gql`
  query DownloadFailedRows(
    $input: FailedDownLoadInput
    $dataImportId: string!
  ) {
    failedRows(input: $input, dataImportId: $dataImportId)
      @rest(
        type: "DataImportFailedRows"
        path: "/FailedRows?dataImportId={args.dataImportId}"
        method: "POST"
        endpoint: "dataImportFailedRows"
      ) {
      failedRows
    }
  }
`;

export const DownloadFailedRowsQuery = {
  _variables: null as any,
  _result: null as any,
  Document: DownloadFailedRowsDocument,
};

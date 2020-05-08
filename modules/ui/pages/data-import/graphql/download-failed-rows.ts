import gql from "graphql-tag";

export const DownloadFailedRowsDocument = gql`
  query ExportReport($dataImportId: ID!) {
    dataImport(dataImportId: $dataImportId)
      @rest(
        type: "DataImportDownloadFailedRows"
        path: "?dataImportId={args.dataImportId}"
        method: "POST"
        endpoint: "dataImportFailedRows"
      ) {
      rows
    }
  }
`;

export const DownloadFailedRowsQuery = {
  _variables: null as any,
  _result: null as any,
  Document: DownloadFailedRowsDocument,
};

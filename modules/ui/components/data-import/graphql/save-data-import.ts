import gql from "graphql-tag";
import { DataImportType } from "graphql/server-types.gen";

export type DataImportOptions = {
  orgId: string;
  dataImportTypeId: string;
  parseOnly?: boolean;
  validateOnly?: boolean;
  ignoreWarnings?: boolean;
  maxParseErrors?: number;
  maxValidationErrors?: number;
  maxImportErrors?: number;
  earliestStartUtc?: Date;
  notificationEmailAddresses?: string[];
};

export type SaveDataImportInput = {
  importOptions: DataImportOptions;
  file: File;
};

export const SaveDataImportDocument = gql`
  mutation SaveDataImport($input: SaveDataImportInput!, $formSerializer: any) {
    saveDataImport(input: $input)
      @rest(
        type: "SaveDataImport"
        path: "api/DataImport"
        method: "POST"
        bodySerializer: $formSerializer
      ) {
      isSuccess
      message
    }
  }
`;

export const SaveDataImportMutation = {
  _variables: null as any,
  _result: null as any,
  Document: SaveDataImportDocument,
};

export const formSerializer = (data: any, headers: Headers) => {
  const formData = new FormData();
  formData.append("ImportOptions", JSON.stringify(data.importOptions));
  formData.append("file", data.file, data.file.name);
  headers.set("Accept", "*/*");
  return { body: formData, headers };
};

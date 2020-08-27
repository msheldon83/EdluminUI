import {
  InMemoryCache,
  NormalizedCacheObject,
  IntrospectionFragmentMatcher,
} from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { ApolloLink } from "apollo-link";
import { RestLink } from "apollo-link-rest";
import { createHttpLink } from "apollo-link-http";
import { History } from "history";
import { compact } from "lodash-es";
import introspectionQueryResultData from "./fragment-types.gen.json";

export function buildGraphqlClient(opts: {
  history: History<any>;
  fetch?: any;
  uri?: string;
  prefixLink?: ApolloLink;
}): ApolloClient<NormalizedCacheObject> {
  const { history, fetch, uri, prefixLink } = {
    uri: Config.apiUri,
    ...opts,
  };

  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData,
  });
  const cache = new InMemoryCache({ fragmentMatcher });

  const restLink = new RestLink({
    uri: Config.restUri,
    endpoints: {
      reportExport: {
        uri: `${Config.restUri}api/report/export`,
        responseTransformer: async (data: any, typeName: string) =>
          fileDownloadResponseTransformer(data, "Report"),
      },
      dataImportFailedRows: {
        uri: `${Config.restUri}api/DataImport`,
        responseTransformer: async (data: any, typeName: string) =>
          fileDownloadResponseTransformer(data, "FailedRows"),
      },
      connectionDownload: {
        uri: `${Config.restUri}`,
        responseTransformer: async (data: any, typeName: string) =>
          fileDownloadResponseTransformer(data, "Download", false),
      },
    },
  });
  const links = [...compact([prefixLink]), restLink, createHttpLink({ uri })];
  const link = ApolloLink.from(links);
  const client = new ApolloClient({
    cache: cache,
    link,
    defaultOptions: {
      watchQuery: {
        // this governs the default fetch policy for react-apollo useQuery():
        fetchPolicy: "cache-and-network",
      },
    },
  });

  return client;
}

const fileDownloadResponseTransformer = async (
  response: any,
  defaultFileName?: string,
  appendExtension?: boolean = true
) => {
  if (response.ok) {
    // Get the filename out of the header
    const contentDispositionHeader =
      response.headers.get("Content-Disposition")?.toString() ?? "";
    const contentDispositionPieces = contentDispositionHeader
      .split(";")
      .map((c: any) => c.toString().trim());
    const filename =
      contentDispositionPieces
        .find((c: any) => c.toString().startsWith("filename="))
        ?.replace("filename=", "") ??
      defaultFileName ??
      "file";

    // Get the content type out of the header so we can use the right file extension
    const contentTypeHeader = response.headers.get("Content-Type")?.toString();
    let fileExtension = "csv";
    switch (contentTypeHeader) {
      case "application/pdf":
        fileExtension = "pdf";
        break;
      case "text/csv":
        fileExtension = "csv";
        break;
    }

    return response.blob().then((b: any) => {
      const url = window.URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.${fileExtension}`;
      // We need to append the element to the dom -> otherwise it will not work in firefox
      document.body.appendChild(a);
      a.click();
      // Afterwards we remove the element again
      a.remove();
      // Return an empty object to make the Apollo Client happy
      return {};
    });
  }
  return Promise.reject(`Could Not Download File`);
};

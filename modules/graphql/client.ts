import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { ApolloLink } from "apollo-link";
import { BatchHttpLink } from "apollo-link-batch-http";
import { createHttpLink } from "apollo-link-http";
import { History } from "history";
import { compact } from "lodash-es";

export function buildGraphqlClient(opts: {
  history: History<any>;
  fetch?: any;
  uri?: string;
  prefixLink?: ApolloLink;
}): ApolloClient<NormalizedCacheObject> {
  const { history, fetch, uri, prefixLink } = {
    uri: "/graphql",
    ...opts,
  };
  const cache = new InMemoryCache();
  const links = [
    ...compact([prefixLink]),
    createHttpLink({ uri }),
    // new BatchHttpLink({
    //   uri: uri,
    //   batchInterval: 10,
    //   credentials: "same-origin",
    //   fetch,
    // }),
  ];
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

import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { ApolloLink } from "apollo-link";
import { RestLink } from "apollo-link-rest";
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
    uri: Config.apiUri,
    ...opts,
  };
  const cache = new InMemoryCache();
  const restLink = new RestLink({ uri: "/api" });
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

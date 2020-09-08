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

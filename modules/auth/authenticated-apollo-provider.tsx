import * as React from "react";
import { ApolloProvider } from "@apollo/react-common";
import { ApolloLink, fromPromise, Operation } from "apollo-link";
import ApolloClient from "apollo-client";
import { useAuth0, Auth0Context } from "./auth0";
import { useMemo } from "react";

type Props = {
  buildApolloClient: (authLink: ApolloLink) => ApolloClient<any>;
};

export const AuthenticatedApolloProvider: React.FC<Props> = ({
  children,
  buildApolloClient,
}) => {
  const auth0 = useAuth0();
  const client = useMemo(() => {
    const authLink = new ApolloLink((op, forward) => {
      return fromPromise(addAuthToOperation(op, auth0)).flatMap(forward);
    });
    return buildApolloClient(authLink);
  }, [auth0, buildApolloClient]);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

const addAuthToOperation = async (op: Operation, auth0: Auth0Context) => {
  const token = await auth0.getToken();
  let additionalHeaders: any = {
    authorization: `Bearer ${token}`,
  };

  // If impersonating a User, add that key and value to the headers
  const actingUserId = sessionStorage.getItem(
    Config.impersonation.actingUserIdKey
  );
  if (actingUserId) {
    additionalHeaders = {
      ...additionalHeaders,
      [Config.impersonation.actingUserIdKey]: actingUserId,
    };
  }

  // If impersonating a specific Org User, add that key and value to the headers
  const actingOrgUserId = sessionStorage.getItem(
    Config.impersonation.actingOrgUserIdKey
  );
  if (actingOrgUserId) {
    additionalHeaders = {
      ...additionalHeaders,
      [Config.impersonation.actingOrgUserIdKey]: actingOrgUserId,
    };
  }

  op.setContext(({ headers }: { headers: any }) => ({
    headers: {
      ...headers,
      ...additionalHeaders,
    },
  }));
  return op;
};

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
      return fromPromise(addTokenToOperation(op, auth0)).flatMap(forward);
    });
    console.log("building apollo client");
    return buildApolloClient(authLink);
  }, [auth0, buildApolloClient]);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

const addTokenToOperation = async (op: Operation, auth0: Auth0Context) => {
  const token = await auth0.getToken();
  op.setContext(({ headers }: { headers: any }) => ({
    headers: { ...headers, authorization: `Bearer ${token}` },
  }));
  return op;
};

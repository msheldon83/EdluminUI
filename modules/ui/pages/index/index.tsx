import * as React from "react";
import { Example } from "graphql/queries/Example.gen";
import { useQueryBundle } from "graphql/hooks";
import { useAuth0 } from "auth/auth0";

export const ExamplePage: React.FunctionComponent = props => {
  const loggedIn = useAuth0().isAuthenticated;
  const data = useQueryBundle(Example, { skip: !loggedIn });
  if (data.state === "DONE") {
    console.log("omg", data.data);
  }
  console.log("rendering.", loggedIn, data);
  const name =
    data.state === "DONE" &&
    data.data.userAccess &&
    data.data.userAccess.me &&
    data.data.userAccess.me.user &&
    data.data.userAccess.me.user.id
      ? data.data.userAccess.me.user.id
      : "anonymous";
  return <div>Hello {name}</div>;
};

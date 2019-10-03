import { createBrowserHistory } from "history";
import * as React from "react";
import { useCallback } from "react";
import * as ReactDom from "react-dom";
import { Router } from "react-router-dom";
import { App } from "ui";

import { Example } from "graphql/queries/Example.gen";
import { buildGraphqlClient } from "graphql/client";
import { Auth0Provider } from "auth/auth0";
import { ApolloLink } from "apollo-link";
import { AuthenticatedApolloProvider } from "auth/authenticated-apollo-provider";

const history = createBrowserHistory();
// history.listen((location, action) => {
//   if (process.env.TRACKING_ID) {
//     window.ga("send", "pageview", location.pathname + location.search);
//   }
// });

const bootstrapClient = () => {
  const graphqlClient = (authLink: ApolloLink) =>
    buildGraphqlClient({ history, prefixLink: authLink });

  const rootEl = (
    <Auth0Provider history={history}>
      <AuthenticatedApolloProvider buildApolloClient={graphqlClient}>
        <Router history={history}>
          <App />
        </Router>
      </AuthenticatedApolloProvider>
    </Auth0Provider>
  );
  ReactDom.render(
    (rootEl as any) as React.ReactElement<any>,
    document.getElementById("edlumin-app")
  );
};

bootstrapClient();

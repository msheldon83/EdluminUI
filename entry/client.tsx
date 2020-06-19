import { createBrowserHistory } from "history";
import * as React from "react";
import * as ReactDom from "react-dom";
import { Router, BrowserRouter } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { App } from "ui";
import { buildGraphqlClient } from "graphql/client";
import { Auth0Provider } from "auth/auth0";
import { ApolloLink } from "apollo-link";
import "./i18n";
import { AuthenticatedApolloProvider } from "auth/authenticated-apollo-provider";
import RedRoverPrompt from "ui/components/routing/red-rover-prompt";

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
        <BrowserRouter
          getUserConfirmation={(message, callback) =>
            RedRoverPrompt(message, callback)
          }
        >
          <DndProvider backend={HTML5Backend}>
            <App />
          </DndProvider>
        </BrowserRouter>
      </AuthenticatedApolloProvider>
    </Auth0Provider>
  );
  ReactDom.render(
    (rootEl as any) as React.ReactElement<any>,
    document.getElementById("edlumin-app")
  );
};

bootstrapClient();

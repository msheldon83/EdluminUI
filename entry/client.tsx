import { createBrowserHistory } from "history";
import * as React from "react";
import * as ReactDom from "react-dom";
import { Router } from "react-router-dom";
import { App } from "ui";

import { Example } from "graphql/queries/Example.gen";

const history = createBrowserHistory();
// history.listen((location, action) => {
//   if (process.env.TRACKING_ID) {
//     window.ga("send", "pageview", location.pathname + location.search);
//   }
// });

const bootstrapClient = () => {
  // const graphqlClient = buildGraphqlClient({ history });

  const rootEl = (
    // <ApolloProvider client={graphqlClient}>
    <Router history={history}>
      <App />
    </Router>
    // </ApolloProvider>
  );
  console.log(document.getElementById("edlumin-app"));
  ReactDom.render(
    (rootEl as any) as React.ReactElement<any>,
    document.getElementById("edlumin-app")
  );
};

bootstrapClient();

import * as React from "react";
import { asyncComponent } from "client/async-component";
import { RouteComponentProps } from "react-router-dom";

export const IndexLoader = asyncComponent({
  resolve: async () => {
    const IndexPage = (await import("client/pages/index")).ExamplePage;

    const Wrapper: React.FunctionComponent<RouteComponentProps<{}>> = props => (
      <IndexPage />
    );

    return Wrapper;
  },
  name: "Index",
});

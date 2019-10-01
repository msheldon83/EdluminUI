import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { asyncComponent } from "ui/async-component";

export const IndexLoader = asyncComponent({
  resolve: async () => {
    const IndexPage = (await import("ui/pages/index")).ExamplePage;

    const Wrapper: React.FunctionComponent<RouteComponentProps<{}>> = props => (
      <IndexPage />
    );

    return Wrapper;
  },
  name: "Index",
});

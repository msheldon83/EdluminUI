import { generatePath, RouteComponentProps } from "react-router-dom";
import { asyncComponent } from "ui/async-component";
import * as React from "react";

export const IndexLoader = asyncComponent({
  resolve: async () => {
    const IndexPage = (await import("ui/pages/index")).ExamplePage;
    return IndexPage;
  },
  name: "Index",
});

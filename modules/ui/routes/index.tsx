import { generatePath, RouteComponentProps } from "react-router-dom";
import { asyncComponent } from "ui/async-component";
import * as React from "react";
import { AppChrome } from "./app-chrome";

export namespace Index {
  export const PATH_TEMPLATE = "/:organizationId/:role";

  export type Params = AppChrome.Params;

  export function generate(params: Params) {
    return generatePath(PATH_TEMPLATE, params);
  }
}

export const IndexLoader = asyncComponent({
  resolve: async () => {
    const IndexPage = (await import("ui/pages/index")).ExamplePage;
    return IndexPage;
  },
  name: "Index",
});

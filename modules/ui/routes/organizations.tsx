import { generatePath, RouteComponentProps } from "react-router-dom";
import { asyncComponent } from "ui/async-component";
import * as React from "react";

export namespace Organizations {
  export const PATH_TEMPLATE = "/admin/organizations";

  export function generate() {
    return generatePath(PATH_TEMPLATE);
  }
}

export const OrganizationsLoader = asyncComponent({
  resolve: async () => {
    const OrganizationsPage = (await import("ui/pages/organizations")).OrganizationsPage;
    return OrganizationsPage;
  },
  name: "Organizations",
});

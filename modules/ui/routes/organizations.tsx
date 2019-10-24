import { generatePath, RouteComponentProps } from "react-router-dom";
import { asyncComponent } from "ui/async-component";
import * as React from "react";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const OrganizationsRoute = defineSubRoute(AdminChromeRoute, "/organizations");

export const OrganizationsLoader = asyncComponent({
  resolve: async () => {
    const OrganizationsPage = (await import("ui/pages/organizations")).OrganizationsPage;
    return OrganizationsPage;
  },
  name: "Organizations",
});

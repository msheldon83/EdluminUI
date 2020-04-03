import { asyncComponent } from "ui/async-component";
import * as React from "react";
import {
  AdminChromeRoute,
  AppChromeRoute,
  AdminRootChromeRoute,
} from "./app-chrome";
import { defineSubRoute } from "./definition";

export const OrganizationsRoute = defineSubRoute(
  AdminChromeRoute,
  "/organizations"
);

export const OrganizationsLoader = asyncComponent({
  resolve: async () => {
    const OrganizationsPage = (await import("ui/pages/organizations"))
      .OrganizationsPage;
    return OrganizationsPage;
  },
  name: "Organizations",
});

export const OrganizationContactInfoRoute = defineSubRoute(
  AppChromeRoute,
  "/contact-info"
);

export const OrganizationContactInfoLoader = asyncComponent({
  resolve: async () => {
    const OrganicationContactInfo = (
      await import("ui/pages/organizations/org-contact-info")
    ).OrganicationContactInfo;
    return OrganicationContactInfo;
  },
  name: "OrganicationContactInfo",
});

//Create New Org
export const OrganizationAddRoute = defineSubRoute(
  AdminRootChromeRoute,
  "/organizations/add"
);

export const OrganizationAddLoader = asyncComponent({
  resolve: async () => {
    const OrganizationAddPage = (await import("ui/pages/organizations/add"))
      .OrganizationAddPage;
    return OrganizationAddPage;
  },
  name: "OrganizationAddPage",
});

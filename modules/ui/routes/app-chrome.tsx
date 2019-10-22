import { defineRoute, defineSubRoute } from "./definition";

export const AppChromeRoute = defineRoute("/:role", ["role"]);

export const AdminChromeRoute = defineSubRoute(
  AppChromeRoute,
  "/:organizationId",
  ["organizationId"]
);

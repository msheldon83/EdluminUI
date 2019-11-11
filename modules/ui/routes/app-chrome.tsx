import { defineRoute, defineSubRoute } from "./definition";

export const AppChromeRoute = defineRoute("/:role", ["role"]);

export const EmployeeChromeRoute = defineRoute("/employee", []);

export const AdminChromeRoute = defineRoute("/admin/:organizationId", [
  "organizationId",
]);

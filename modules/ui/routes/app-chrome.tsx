import { defineRoute } from "./definition";

export const AppChromeRoute = defineRoute("/:organizationId/:role", [
  "organizationId",
  "role",
]);

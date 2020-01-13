import { asyncComponent } from "ui/async-component";
import { defineRoute, defineSubRoute } from "./definition";
import {
  AdminChromeRoute,
  EmployeeChromeRoute,
  SubstituteChromeRoute,
} from "./app-chrome";

export const UnauthorizedRoute = defineRoute("/unauthorized");
// In order to maintain the left hand navigation in scenarios
// where the User just doesn't have access to a page within
// their Role and Organization, we have to define
// Unauthorized routes for each individual role
export const UnauthorizedAdminRoleRoute = defineSubRoute(
  AdminChromeRoute,
  "unauthorized"
);
export const UnauthorizedEmployeeRoleRoute = defineSubRoute(
  EmployeeChromeRoute,
  "unauthorized"
);
export const UnauthorizedSubstituteRoleRoute = defineSubRoute(
  SubstituteChromeRoute,
  "unauthorized"
);

export const UnauthorizedLoader = asyncComponent({
  resolve: async () => {
    const UnauthorizedPage = (await import("ui/pages/unauthorized"))
      .Unauthorized;
    return UnauthorizedPage;
  },
  name: "Unauthorized",
});

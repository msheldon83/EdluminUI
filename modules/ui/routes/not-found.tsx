import { asyncComponent } from "ui/async-component";
import { defineRoute, defineSubRoute } from "./definition";
import {
  AdminChromeRoute,
  AdminRootChromeRoute,
  EmployeeChromeRoute,
  SubstituteChromeRoute,
} from "./app-chrome";

export const NotFoundRoute = defineRoute("/notfound");
// In order to maintain the left hand navigation in scenarios
// where the User just doesn't find a page within
// their Role and Organization, we have to define
// NotFound routes for each individual role

export const NotFoundAdminRootRoute = defineSubRoute(
  AdminRootChromeRoute,
  "notfound"
);
export const NotFoundAdminRoleRoute = defineSubRoute(
  AdminChromeRoute,
  "notfound"
);
export const NotFoundEmployeeRoleRoute = defineSubRoute(
  EmployeeChromeRoute,
  "notfound"
);
export const NotFoundSubstituteRoleRoute = defineSubRoute(
  SubstituteChromeRoute,
  "notfound"
);

export const NotFoundLoader = asyncComponent({
  resolve: async () => {
    const NotFoundPage = (await import("ui/pages/not-found")).NotFound;
    return NotFoundPage;
  },
  name: "NotFound",
});

import { asyncComponent } from "ui/async-component";
import { EmployeeChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const EmployeeSubPreferenceRoute = defineSubRoute(
  EmployeeChromeRoute,
  "/substitute-preferences"
);

export const EmployeeSubPreferenceRouteLoader = asyncComponent({
  resolve: async () => {
    const EmployeeSubPreferenceRoute = (
      await import("ui/pages/employee-sub-preferences/index")
    ).EmployeeSubstitutePreferencePage;
    return EmployeeSubPreferenceRoute;
  },
  name: "EmployeeSubPreferenceRoute",
});

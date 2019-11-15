import { asyncComponent } from "ui/async-component";
import { EmployeeChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const EmployeeHomeRoute = defineSubRoute(EmployeeChromeRoute, "");

export const EmployeeHomeLoader = asyncComponent({
  resolve: async () => {
    const EmployeeHome = (await import("ui/pages/employee-home/index"))
      .EmployeeHome;
    return EmployeeHome;
  },
  name: "EmployeeHome",
});

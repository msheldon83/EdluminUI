import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute, EmployeeChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const AdminEditAbsenceRoute = defineSubRoute(
  AdminChromeRoute,
  "absence/edit/:absenceId",
  ["absenceId"]
);

export const AdminEditAbsenceLoader = asyncComponent({
  async resolve() {
    return (await import("ui/pages/edit-absence")).EditAbsence;
  },
});

export const EmployeeEditAbsenceRoute = defineSubRoute(
  EmployeeChromeRoute,
  "/absence/edit/:absenceId",
  ["absenceId"]
);

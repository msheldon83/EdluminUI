import { defineSubRoute } from "./definition";
import { PeopleRoute } from "./people";
import { EmployeeChromeRoute } from "./app-chrome";
import { asyncComponent } from "ui/async-component";

export const AdminEditAbsenceRoute = defineSubRoute(
  PeopleRoute,
  "absence/edit/:absenceId",
  ["absenceId"]
);

export const AdminEditAbsenceLoader = asyncComponent({
  async resolve() {
    return (await import("ui/pages/edit-absence/admin")).EditAbsence;
  },
});

export const EmployeeEditAbsenceRoute = defineSubRoute(
  EmployeeChromeRoute,
  "/absence/edit/:absenceId",
  ["absenceId"]
);

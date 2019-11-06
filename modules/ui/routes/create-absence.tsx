import { asyncComponent } from "ui/async-component";
import { AppChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";
import { PeopleRoute } from "./people";

// Admin Route
export const AdminCreateAbsenceRoute = defineSubRoute(
  PeopleRoute,
  "/:employeeId/absence/create",
  ["employeeId"]
);

// Employee Route
export const EmployeeCreateAbsenceRoute = defineSubRoute(
  AppChromeRoute,
  "/absence/create"
);

export const CreateAbsenceLoader = asyncComponent({
  resolve: async () => {
    const CreateAbsencePage = (await import("ui/pages/create-absence"))
      .CreateAbsence;
    return CreateAbsencePage;
  },
  name: "Create Absence",
});

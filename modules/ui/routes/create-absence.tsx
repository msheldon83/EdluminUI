import { asyncComponent } from "ui/async-component";
import {
  AppChromeRoute,
  EmployeeChromeRoute,
  AdminChromeRoute,
} from "./app-chrome";
import { defineSubRoute } from "./definition";

// Admin Route
export const AdminCreateAbsenceRoute = defineSubRoute(
  AdminChromeRoute,
  "absence/create/:employeeId",
  ["employeeId"]
);

export const AdminSelectEmployeeForCreateAbsenceRoute = defineSubRoute(
  AdminChromeRoute,
  "/absence/create"
);

// Employee Route
export const EmployeeCreateAbsenceRoute = defineSubRoute(
  EmployeeChromeRoute,
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

export const EmployeeCreateAbsenceLoader = asyncComponent({
  async resolve() {
    return (await import("ui/pages/create-absence/employee"))
      .EmployeeCreateAbsence;
  },
  name: "Employee Create Absence",
});

export const SelectEmployeeForCreateAbsenceLoader = asyncComponent({
  async resolve() {
    return (await import("ui/pages/create-absence/select-employee"))
      .SelectEmployee;
  },
  name: "Select Employee for Absence",
});

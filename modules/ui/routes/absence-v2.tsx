import { asyncComponent } from "ui/async-component";
import { EmployeeChromeRoute, AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

// Admin Route
export const AdminCreateAbsenceRouteV2 = defineSubRoute(
  AdminChromeRoute,
  "absence/v2/create/:employeeId",
  ["employeeId"]
);

export const AdminSelectEmployeeForCreateAbsenceRouteV2 = defineSubRoute(
  AdminChromeRoute,
  "/absence/v2/create"
);

// Employee Route
export const EmployeeCreateAbsenceRouteV2 = defineSubRoute(
  EmployeeChromeRoute,
  "/absence/v2/create"
);

export const CreateAbsenceLoaderV2 = asyncComponent({
  resolve: async () => {
    const AdminCreateAbsence = (
      await import("ui/pages/absence-v2/create/admin-index")
    ).AdminCreateAbsence;
    return AdminCreateAbsence;
  },
  name: "Create Absence",
});

export const EmployeeCreateAbsenceLoaderV2 = asyncComponent({
  async resolve() {
    return (await import("ui/pages/absence-v2/create/employee-index"))
      .EmployeeCreateAbsence;
  },
  name: "Employee Create Absence",
});

export const SelectEmployeeForCreateAbsenceLoaderV2 = asyncComponent({
  async resolve() {
    return (await import("ui/pages/absence-v2/create/select-employee"))
      .SelectEmployee;
  },
  name: "Select Employee for Absence",
});

// // Quick Create from Employee Home redirects to confimation route
// export const CreateAbsenceConfirmationRoute = defineSubRoute(
//   EmployeeCreateAbsenceRoute,
//   "/:absenceId/confirmation",
//   ["absenceId"]
// );

// export const CreateAbsenceConfirmationLoader = asyncComponent({
//   resolve: async () => {
//     const CreateAbsenceConfirmationPage = (
//       await import(
//         "ui/pages/employee-home/components/quick-absence-create/quick-create-confirmation"
//       )
//     ).QuickCreateConfirmation;
//     return CreateAbsenceConfirmationPage;
//   },
//   name: "Create Absence Confirmation",
// });

// Edit
export const AdminEditAbsenceRouteV2 = defineSubRoute(
  AdminChromeRoute,
  "absence/v2/edit/:absenceId",
  ["absenceId"]
);

export const EmployeeEditAbsenceRouteV2 = defineSubRoute(
  EmployeeChromeRoute,
  "/absence/v2/edit/:absenceId",
  ["absenceId"]
);

export const EditAbsenceLoaderV2 = asyncComponent({
  async resolve() {
    return (await import("ui/pages/absence-v2/edit")).EditAbsence;
  },
});

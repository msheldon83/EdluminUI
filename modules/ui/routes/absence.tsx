import { asyncComponent } from "ui/async-component";
import { EmployeeChromeRoute, AdminChromeRoute } from "./app-chrome";
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
    const AdminCreateAbsence = (
      await import("ui/pages/absence/create/admin-index")
    ).AdminCreateAbsence;
    return AdminCreateAbsence;
  },
  name: "Create Absence",
});

export const EmployeeCreateAbsenceLoader = asyncComponent({
  async resolve() {
    return (await import("ui/pages/absence/create/employee-index"))
      .EmployeeCreateAbsence;
  },
  name: "Employee Create Absence",
});

export const SelectEmployeeForCreateAbsenceLoader = asyncComponent({
  async resolve() {
    return (await import("ui/pages/absence/create/select-employee"))
      .SelectEmployee;
  },
  name: "Select Employee for Absence",
});

// Quick Create from Employee Home redirects to confimation route
export const EmployeeCreateAbsenceConfirmationRoute = defineSubRoute(
  EmployeeCreateAbsenceRoute,
  "/:absenceId/confirmation",
  ["absenceId"]
);

export const EmployeeCreateAbsenceConfirmationLoader = asyncComponent({
  resolve: async () => {
    const EmployeeCreateAbsenceConfirmationPage = (
      await import(
        "ui/pages/absence/create/employee-quick-create-confirmation"
      )
    ).EmployeeQuickAbsenceCreateConfirmation;
    return EmployeeCreateAbsenceConfirmationPage;
  },
  name: "Create Absence Confirmation",
});

// Edit
export const AdminEditAbsenceRoute = defineSubRoute(
  AdminChromeRoute,
  "absence/edit/:absenceId",
  ["absenceId"]
);

export const EmployeeEditAbsenceRoute = defineSubRoute(
  EmployeeChromeRoute,
  "/absence/edit/:absenceId",
  ["absenceId"]
);

export const EditAbsenceLoader = asyncComponent({
  async resolve() {
    return (await import("ui/pages/absence/edit")).EditAbsence;
  },
});

// Admin Approval edit
export const AdminAbsenceApprovalViewRoute = defineSubRoute(
  AdminChromeRoute,
  "absence/approval/:absenceId",
  ["absenceId"]
);

// Employee Approval edit
export const EmployeeAbsenceApprovalViewRoute = defineSubRoute(
  EmployeeChromeRoute,
  "absence/approval/:absenceId",
  ["absenceId"]
);

export const AbsenceApprovalViewLoader = asyncComponent({
  resolve: async () => {
    const ApprovalViewPage = (
      await import("ui/pages/absence/edit/approval-detail")
    ).AbsenceApprovalDetail;
    return ApprovalViewPage;
  },
  name: "AbsenceApprovalViewPage",
});

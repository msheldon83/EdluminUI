import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute, EmployeeChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

// Edit
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
      await import("ui/pages/edit-absence/approval-detail")
    ).AbsenceApprovalDetail;
    return ApprovalViewPage;
  },
  name: "AbsenceApprovalViewPage",
});

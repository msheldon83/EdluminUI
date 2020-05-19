import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

// Absence approval workflows
export const AbsenceApprovalWorkflowRoute = defineSubRoute(
  AdminChromeRoute,
  "/approval-workflow-abs"
);

export const AbsenceApprovalWorkflowLoader = asyncComponent({
  resolve: async () => {
    const AbsenceApprovalWorkflowPage = (
      await import("ui/pages/approval-workflow/absence-workflows")
    ).AbsenceApprovalWorkflowIndex;
    return AbsenceApprovalWorkflowPage;
  },
  name: "AbsenceApprovalWorkflow",
});

// Absence approval workflows
export const VacancyApprovalWorkflowRoute = defineSubRoute(
  AdminChromeRoute,
  "/approval-workflow-vac"
);

export const VacancyApprovalWorkflowLoader = asyncComponent({
  resolve: async () => {
    const VacancyApprovalWorkflowPage = (
      await import("ui/pages/approval-workflow/vacancy-workflows")
    ).VacancyApprovalWorkflowIndex;
    return VacancyApprovalWorkflowPage;
  },
  name: "VacancyApprovalWorkflow",
});

// View/edit
export const ApprovalWorkflowEditRoute = defineSubRoute(
  AdminChromeRoute,
  "/approval-workflow/:approvalWorkflowId",
  ["approvalWorkflowId"]
);

export const ApprovalWorkflowEditLoader = asyncComponent({
  resolve: async () => {
    const ApprovalWorkflowEditPage = (
      await import("ui/pages/approval-workflow/edit")
    ).ApprovalWorkflowEdit;
    return ApprovalWorkflowEditPage;
  },
  name: "ApprovalWorkflowEditPage",
});

// Add
export const AbsenceApprovalWorkflowAddRoute = defineSubRoute(
  AdminChromeRoute,
  "/approval-workflow-add-abs"
);

export const AbsenceApprovalWorkflowAddLoader = asyncComponent({
  resolve: async () => {
    const AbsenceApprovalWorkflowAddPage = (
      await import("ui/pages/approval-workflow/add-absence-workflow")
    ).AbsenceApprovalWorkflowAdd;
    return AbsenceApprovalWorkflowAddPage;
  },
  name: "AbsenceApprovalWorkflowAddPage",
});

export const VacancyApprovalWorkflowAddRoute = defineSubRoute(
  AdminChromeRoute,
  "/approval-workflow-add-vac"
);

export const VacancyApprovalWorkflowAddLoader = asyncComponent({
  resolve: async () => {
    const VacancyApprovalWorkflowAddPage = (
      await import("ui/pages/approval-workflow/add-vacancy-workflow")
    ).VacancyApprovalWorkflowAdd;
    return VacancyApprovalWorkflowAddPage;
  },
  name: "VacancyApprovalWorkflowAddPage",
});

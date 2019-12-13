import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./../app-chrome";
import { defineSubRoute } from "./../definition";

export const AbsenceReasonRoute = defineSubRoute(AdminChromeRoute, "/reason");

export const AbsenceReasonLoader = asyncComponent({
  resolve: async () => {
    const AbsenceReasonPage = (await import("ui/pages/absence-reason/index"))
      .AbsenceReason;
    return AbsenceReasonPage;
  },
  name: "AbsenceReason",
});

// View/Edit
export const AbsenceReasonViewRoute = defineSubRoute(
  AbsenceReasonRoute,
  "/:absenceReasonId",
  ["absenceReasonId"]
);

// Add
export const AbsenceReasonAddRoute = defineSubRoute(
  AbsenceReasonRoute,
  "/add",
  []
);

export const AbsenceReasonAddLoader = asyncComponent({
  resolve: async () => {
    const AbsenceReasonAddPage = (await import("ui/pages/absence-reason/add"))
      .AbsenceReasonAddPage;
    return AbsenceReasonAddPage;
  },
  name: "AbsenceReasonAddPage",
});

// Edit Settings
export const AbsenceReasonViewEditRoute = defineSubRoute(
  AbsenceReasonViewRoute,
  "/view",
  []
);

export const AbsenceReasonViewEditLoader = asyncComponent({
  resolve: async () => {
    const AbsenceReasonViewEditPage = (
      await import("ui/pages/absence-reason/view")
    ).AbsenceReasonViewEditPage;
    return AbsenceReasonViewEditPage;
  },
  name: "AbsenceReasonViewEditPage",
});

import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const AbsenceReasonRoute = defineSubRoute(
  AdminChromeRoute,
  "/absence-reason"
);

export const AbsenceReasonLoader = asyncComponent({
  resolve: async () => {
    const AbsenceReasonPage = (await import("ui/pages/absence-reason/index"))
      .AbsenceReason;
    return AbsenceReasonPage;
  },
  name: "AbsenceReason",
});

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

// View/Edit
export const AbsenceReasonViewEditRoute = defineSubRoute(
  AbsenceReasonRoute,
  "/:absenceReasonId",
  ["absenceReasonId"]
);

// Edit Settings
export const AbsenceReasonEditSettingsRoute = defineSubRoute(
  AbsenceReasonViewEditRoute,
  "/edit-settings",
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

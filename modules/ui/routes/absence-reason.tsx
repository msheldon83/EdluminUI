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

export const AbsenceReasonCategoryAddRoute = defineSubRoute(
  AbsenceReasonRoute,
  "/category/add",
  []
);

export const AbsenceReasonCategoryAddLoader = asyncComponent({
  resolve: async () => {
    const AbsenceReasonCategoryAddPage = (
      await import("ui/pages/absence-reason/add-category")
    ).AbsenceReasonCategoryAddPage;
    return AbsenceReasonCategoryAddPage;
  },
  name: "AbsenceReasonCategoryAddPage",
});

// View/Edit
export const AbsenceReasonViewEditRoute = defineSubRoute(
  AbsenceReasonRoute,
  "/:absenceReasonId",
  ["absenceReasonId"]
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

export const AbsenceReasonCategoryViewEditRoute = defineSubRoute(
  AbsenceReasonRoute,
  "category/:absenceReasonCategoryId",
  ["absenceReasonCategoryId"]
);

export const AbsenceReasonCategoryViewEditLoader = asyncComponent({
  resolve: async () => {
    const AbsenceReasonCategoryViewEditPage = (
      await import("ui/pages/absence-reason/view-category")
    ).AbsenceReasonCategoryViewEditPage;
    return AbsenceReasonCategoryViewEditPage;
  },
  name: "AbsenceReasonCategoryViewEditPage",
});

// Edit Settings
export const AbsenceReasonEditSettingsRoute = defineSubRoute(
  AbsenceReasonViewEditRoute,
  "/edit-settings",
  []
);

export const AbsenceReasonEditSettingsLoader = asyncComponent({
  resolve: async () => {
    const AbsenceReasonEditSettingsPage = (
      await import("ui/pages/absence-reason/edit-settings")
    ).AbsenceReasonEditSettingsPage;
    return AbsenceReasonEditSettingsPage;
  },
  name: "AbsenceReasonEditSettingsPage",
});

export const AbsenceReasonCategoryEditSettingsRoute = defineSubRoute(
  AbsenceReasonCategoryViewEditRoute,
  "/edit-settings",
  []
);

export const AbsenceReasonCategoryEditSettingsLoader = asyncComponent({
  resolve: async () => {
    const AbsenceReasonCategoryEditSettingsPage = (
      await import("ui/pages/absence-reason/edit-category-settings")
    ).AbsenceReasonCategoryEditSettingsPage;
    return AbsenceReasonCategoryEditSettingsPage;
  },
  name: "AbsenceReasonCategoryEditSettingsPage",
});

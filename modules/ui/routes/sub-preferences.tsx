import { asyncComponent } from "ui/async-component";
import { SubstituteChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const SubPreferencesRoute = defineSubRoute(
  SubstituteChromeRoute,
  "/preferences"
);

export const SubPreferencesLoader = asyncComponent({
  resolve: async () => {
    const SubPreferencesPage = (await import("ui/pages/sub-preferences/index"))
      .SubPreferencesPage;
    return SubPreferencesPage;
  },
  name: "SubPreferences",
});

export const SubPreferencesEditRoute = defineSubRoute(
  SubPreferencesRoute,
  "/edit"
);

export const SubPreferencesEditLoader = asyncComponent({
  resolve: async () => {
    const SubPreferencesEditPage = (
      await import("ui/pages/sub-preferences/edit")
    ).SubPreferencesEditPage;
    return SubPreferencesEditPage;
  },
  name: "SubPreferencesEdit",
});

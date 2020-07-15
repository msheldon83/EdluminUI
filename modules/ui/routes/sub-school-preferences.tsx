import { asyncComponent } from "ui/async-component";
import { SubstituteChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const SubSchoolPreferencesRoute = defineSubRoute(
  SubstituteChromeRoute,
  "/school-preferences"
);

export const SubSchoolPreferencesLoader = asyncComponent({
  resolve: async () => {
    const SubSchoolPreferencesPage = (
      await import("ui/pages/sub-school-preferences/index")
    ).SubSchoolPreferencesPage;
    return SubSchoolPreferencesPage;
  },
  name: "SubSchoolPreferences",
});

export const SubSchoolPreferencesEditRoute = defineSubRoute(
  SubSchoolPreferencesRoute,
  "/edit"
);

export const SubSchoolPreferencesEditLoader = asyncComponent({
  resolve: async () => {
    const SubSchoolPreferencesEditPage = (
      await import("ui/pages/sub-school-preferences/edit")
    ).SubSchoolPreferencesEditPage;
    return SubSchoolPreferencesEditPage;
  },
  name: "SubSchoolPreferencesEdit",
});

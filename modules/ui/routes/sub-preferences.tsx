import { asyncComponent } from "ui/async-component";
import { SubstituteChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const SubPreferencesRoute = defineSubRoute(
  SubstituteChromeRoute,
  "/preferences"
);

export const SubPreferencesLoader = asyncComponent({
  resolve: async () => {
    const SubPreferences = (await import("ui/pages/sub-preferences/index"))
      .SubPreferences;
    return SubPreferences;
  },
  name: "SubPreferences",
});

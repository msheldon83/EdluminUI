import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const SubstituteSettingsRoute = defineSubRoute(
  AdminChromeRoute,
  "/substitute-settings"
);

export const SubstituteSettingsLoader = asyncComponent({
  resolve: async () => {
    const SubstituteSettingsPage = (
      await import("ui/pages/substitute-settings/index")
    ).SubstituteSettings;
    return SubstituteSettingsPage;
  },
  name: "SubstituteSettings",
});

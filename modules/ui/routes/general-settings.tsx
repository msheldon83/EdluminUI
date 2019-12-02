import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const GeneralSettingsRoute = defineSubRoute(
  AdminChromeRoute,
  "/general-settings"
);

export const GeneralSettingsLoader = asyncComponent({
  resolve: async () => {
    const GeneralSettingsPage = (
      await import("ui/pages/general-settings/index")
    ).GeneralSettings;
    return GeneralSettingsPage;
  },
  name: "GeneralSettings",
});

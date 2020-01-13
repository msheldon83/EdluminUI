import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const OrgSettingsRoute = defineSubRoute(AdminChromeRoute, "/settings");

export const OrgSettingsLoader = asyncComponent({
  resolve: async () => {
    const SettingsPage = (await import("ui/pages/org-settings"))
      .OrgSettingsPage;
    return SettingsPage;
  },
  name: "OrgSettings",
});

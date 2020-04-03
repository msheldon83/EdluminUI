import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const SettingsRoute = defineSubRoute(AdminChromeRoute, "/settings");

export const SettingsLoader = asyncComponent({
  resolve: async () => {
    const SettingsPage = (await import("ui/pages/settings")).SettingsPage;
    return SettingsPage;
  },
  name: "Settings",
});

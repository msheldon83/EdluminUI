import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const ConfigurationRoute = defineSubRoute(AdminChromeRoute, "/config");

export const ConfigurationLoader = asyncComponent({
  resolve: async () => {
    const OrgConfigPage = (await import("ui/pages/org-config")).OrgConfigPage;
    return OrgConfigPage;
  },
  name: "OrgConfig",
});

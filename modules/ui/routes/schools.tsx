import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const SchoolsRoute = defineSubRoute(AdminChromeRoute, "/schools");

export const SchoolsLoader = asyncComponent({
  resolve: async () => {
    const SchoolsPage = (await import("ui/pages/schools/index")).Schools;
    return SchoolsPage;
  },
  name: "Schools",
});

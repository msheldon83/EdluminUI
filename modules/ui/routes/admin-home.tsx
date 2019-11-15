import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const AdminHomeRoute = defineSubRoute(AdminChromeRoute, "");

export const AdminHomeLoader = asyncComponent({
  resolve: async () => {
    const AdminHome = (await import("ui/pages/admin-home/index")).AdminHome;
    return AdminHome;
  },
  name: "AdminHome",
});

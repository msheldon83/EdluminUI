import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const SecurityUsersRoute = defineSubRoute(
  AdminChromeRoute,
  "/security-users"
);

export const SecurityUsersLoader = asyncComponent({
  resolve: async () => {
    const SecurityUsersPage = (await import("ui/pages/security-users/index"))
      .SecurityUsers;
    return SecurityUsersPage;
  },
  name: "SecurityUsers",
});

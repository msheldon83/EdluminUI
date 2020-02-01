import { asyncComponent } from "ui/async-component";
import { AdminRootChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const UsersRoute = defineSubRoute(AdminRootChromeRoute, "/users");

export const UsersLoader = asyncComponent({
  resolve: async () => {
    const UsersPage = (await import("ui/pages/users")).UsersPage;
    return UsersPage;
  },
  name: "Users",
});

// View
export const UserViewRoute = defineSubRoute(UsersRoute, "/:userId", ["userId"]);

export const UserViewLoader = asyncComponent({
  resolve: async () => {
    const UserViewPage = (await import("ui/pages/users/view")).UserViewPage;
    return UserViewPage;
  },
  name: "UserViewPage",
});

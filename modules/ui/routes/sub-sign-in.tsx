import { asyncComponent } from "ui/async-component";
import { defineSubRoute } from "./definition";
import { AdminChromeRoute } from "./app-chrome";

export const SubSignInRoute = defineSubRoute(AdminChromeRoute, "sub-signin");

export const SubSignInLoader = asyncComponent({
  resolve: async () => {
    const SubSignInPage = (await import("ui/pages/sub-sign-in")).SubSignInPage;
    return SubSignInPage;
  },
  name: "SubSignIn",
});

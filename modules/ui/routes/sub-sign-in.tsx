import { asyncComponent } from "ui/async-component";
import { defineRoute } from "./definition";

export const SubSignInRoute = defineRoute("/:organizationId(\\d+)/sub-signin", [
  "organizationId",
]);

export const SubSignInLoader = asyncComponent({
  resolve: async () => {
    const SubSignInPage = (await import("ui/pages/sub-sign-in")).SubSignInPage;
    return SubSignInPage;
  },
  name: "SubSignIn",
});

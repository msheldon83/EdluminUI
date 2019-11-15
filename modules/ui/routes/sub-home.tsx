import { asyncComponent } from "ui/async-component";
import { SubstituteChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const SubHomeRoute = defineSubRoute(SubstituteChromeRoute, "");

export const SubHomeLoader = asyncComponent({
  resolve: async () => {
    const SubHome = (await import("ui/pages/sub-home/index")).SubHome;
    return SubHome;
  },
  name: "SubHome",
});

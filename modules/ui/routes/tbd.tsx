import { defineSubRoute } from "./definition";
import { AppChromeRoute, AdminChromeRoute } from "./app-chrome";
import { asyncComponent } from "ui/async-component";

export const tbd = defineSubRoute(AppChromeRoute, "tbd");
export const adminTbd = defineSubRoute(AdminChromeRoute, "tbd");

export const TbdLoader = asyncComponent({
  resolve: async () => {
    const tbd = (await import("ui/components/under-construction"))
      .UnderConstructionHeader;
    return tbd;
  },
  name: "tbd",
});

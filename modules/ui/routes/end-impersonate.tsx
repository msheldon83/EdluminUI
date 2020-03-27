import { defineSubRoute } from "./definition";
import { AppChromeRoute } from "./app-chrome";
import { asyncComponent } from "ui/async-component";

export const endImpersonationRoute = defineSubRoute(
  AppChromeRoute,
  "impersonate/end"
);

export const EndImpersonationLoader = asyncComponent({
  resolve: async () => {
    const endImpersonate = (await import("ui/pages/end-impersonate"))
      .EndImpersonate;
    return endImpersonate;
  },
  name: "endImpersonate",
});

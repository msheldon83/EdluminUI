import { defineRoute } from "./definition";
import { asyncComponent } from "ui/async-component";

export const endImpersonationRoute = defineRoute("impersonate/end");

export const EndImpersonationLoader = asyncComponent({
  resolve: async () => {
    const endImpersonate = (await import("ui/pages/end-impersonate"))
      .EndImpersonate;
    return endImpersonate;
  },
  name: "endImpersonate",
});

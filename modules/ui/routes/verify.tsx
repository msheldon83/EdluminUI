import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const VerifyRoute = defineSubRoute(AdminChromeRoute, "/verify");

export const VerifyLoader = asyncComponent({
  resolve: async () => {
    const VerifyPage = (await import("ui/pages/verify")).VerifyPage;
    return VerifyPage;
  },
  name: "Verify",
});

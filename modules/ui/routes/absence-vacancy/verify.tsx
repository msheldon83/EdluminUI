import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "../app-chrome";
import { defineSubRoute } from "../definition";

export const VerifyRoute = defineSubRoute(
  AdminChromeRoute,
  "/absence-vacancy/verify"
);

export const VerifyOverviewRoute = defineSubRoute(VerifyRoute, "/overview");

export const VerifyOverviewLoader = asyncComponent({
  resolve: async () => {
    const VerifyOverviewPage = (await import("ui/pages/verify/overview"))
      .VerifyOverviewPage;
    return VerifyOverviewPage;
  },
  name: "VerifyOverview",
});

export const VerifyDailyRoute = defineSubRoute(VerifyRoute, "/daily");

export const VerifyDailyLoader = asyncComponent({
  resolve: async () => {
    const VerifyDailyPage = (await import("ui/pages/verify/daily"))
      .VerifyDailyPage;
    return VerifyDailyPage;
  },
  name: "VerifyDaily",
});

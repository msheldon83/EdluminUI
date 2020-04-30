import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const HoursToDaysRoute = defineSubRoute(
  AdminChromeRoute,
  "/hours-to-days"
);

export const HoursToDaysLoader = asyncComponent({
  resolve: async () => {
    const HoursToDaysPage = (await import("ui/pages/hours-to-days"))
      .HoursToDays;
    return HoursToDaysPage;
  },
  name: "HoursToDays",
});

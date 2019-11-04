import { asyncComponent } from "ui/async-component";
import * as React from "react";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const BellScheduleRoute = defineSubRoute(AdminChromeRoute, "/bell-schedule");

export const BellScheduleLoader = asyncComponent({
  resolve: async () => {
    const BellSchedulePage = (await import("ui/pages/bell-schedule")).BellSchedulePage;
    return BellSchedulePage;
  },
  name: "BellSchedule",
});
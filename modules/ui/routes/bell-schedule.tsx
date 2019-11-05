import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

// List
export const BellScheduleRoute = defineSubRoute(
  AdminChromeRoute,
  "/bell-schedule"
);

export const BellScheduleLoader = asyncComponent({
  resolve: async () => {
    const BellSchedulePage = (await import("ui/pages/bell-schedule"))
      .BellSchedulePage;
    return BellSchedulePage;
  },
  name: "BellSchedule",
});

// View
export const BellScheduleViewRoute = defineSubRoute(
  BellScheduleRoute,
  "/:workDayScheduleId",
  ["workDayScheduleId"]
);

export const BellScheduleViewLoader = asyncComponent({
  resolve: async () => {
    const BellScheduleViewPage = (await import("ui/pages/bell-schedule/view"))
      .BellScheduleViewPage;
    return BellScheduleViewPage;
  },
  name: "BellScheduleViewPage",
});

// Add
export const BellScheduleAddRoute = defineSubRoute(
  BellScheduleRoute,
  "/add",
  []
);

export const BellScheduleAddLoader = asyncComponent({
  resolve: async () => {
    const BellScheduleAddPage = (await import("ui/pages/bell-schedule/add"))
      .BellScheduleAddPage;
    return BellScheduleAddPage;
  },
  name: "BellScheduleAddPage",
});

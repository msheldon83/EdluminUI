import { asyncComponent } from "ui/async-component";
import { SubstituteChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const SubScheduleRoute = defineSubRoute(
  SubstituteChromeRoute,
  "/schedule"
);

export const SubScheduleLoader = asyncComponent({
  resolve: async () => {
    const SubSchedule = (await import("ui/pages/sub-schedule/index"))
      .SubSchedule;
    return SubSchedule;
  },
  name: "SubSchedule",
});

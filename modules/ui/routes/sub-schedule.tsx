import { asyncComponent } from "ui/async-component";
import { SubstituteChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const SubScheduleRoute = defineSubRoute(
  SubstituteChromeRoute,
  "/schedule/view"
);

export const SubScheduleListViewRoute = defineSubRoute(
  SubScheduleRoute,
  "/list"
);
export const SubScheduleCalendarViewRoute = defineSubRoute(
  SubScheduleRoute,
  "/calendar"
);

export const SubScheduleLoader = asyncComponent({
  resolve: async () => {
    const SubSchedule = (await import("ui/pages/sub-schedule/index"))
      .SubSchedule;
    return SubSchedule;
  },
  name: "SubSchedule",
});

export const SubAvailabilityRoute = defineSubRoute(
  SubstituteChromeRoute,
  "/schedule/availability"
);

export const SubAvailabilityLoader = asyncComponent({
  resolve: async () => {
    const SubAvailability = (await import("ui/pages/sub-availability/index"))
      .SubAvailabilityPage;
    return SubAvailability;
  },
  name: "SubSchedule",
});

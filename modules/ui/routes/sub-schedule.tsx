import { asyncComponent } from "ui/async-component";
import { SubstituteChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const SubScheduleRoute = defineSubRoute(
  SubstituteChromeRoute,
  "/schedule"
);

export const SubScheduleListViewRoute = defineSubRoute(
  SubScheduleRoute,
  "/list-view"
);
export const SubScheduleCalendarViewRoute = defineSubRoute(
  SubScheduleRoute,
  "/calendar-view"
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
  SubScheduleRoute,
  "/availability"
);

export const SubAvailabilityPreloadedRoute = defineSubRoute(
  SubAvailabilityRoute,
  "/from/:fromDate/to/:toDate",
  ["fromDate", "toDate"]
);

export const SubAvailabilityLoader = asyncComponent({
  resolve: async () => {
    const SubAvailability = (await import("ui/pages/sub-availability/index"))
      .SubAvailabilityPage;
    return SubAvailability;
  },
  name: "SubSchedule",
});

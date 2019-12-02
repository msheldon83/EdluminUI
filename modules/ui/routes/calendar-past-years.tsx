import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const CalendarPastYearsRoute = defineSubRoute(
  AdminChromeRoute,
  "/calendar-past-years"
);

export const CalendarPastYearsLoader = asyncComponent({
  resolve: async () => {
    const CalendarPastYearsPage = (
      await import("ui/pages/calendar-past-years/index")
    ).CalendarPastYears;
    return CalendarPastYearsPage;
  },
  name: "CalendarPastYears",
});

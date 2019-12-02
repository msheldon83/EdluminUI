import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const CalendarThisYearRoute = defineSubRoute(
  AdminChromeRoute,
  "/calendar-this-year"
);

export const CalendarThisYearLoader = asyncComponent({
  resolve: async () => {
    const CalendarThisYearPage = (
      await import("ui/pages/calendar-this-year/index")
    ).CalendarThisYear;
    return CalendarThisYearPage;
  },
  name: "CalendarThisYear",
});

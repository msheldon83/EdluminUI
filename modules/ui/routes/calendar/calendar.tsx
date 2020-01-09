import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "../app-chrome";
import { defineSubRoute } from "../definition";

export const CalendarRoute = defineSubRoute(AdminChromeRoute, "/calendars");

export const CalendarListViewRoute = defineSubRoute(
  CalendarRoute,
  "/list-view"
);
export const CalendarCalendarViewRoute = defineSubRoute(
  CalendarRoute,
  "/calendar-view"
);

export const CalendarsLoader = asyncComponent({
  resolve: async () => {
    const CalendarsPage = (await import("ui/pages/calendars/index")).Calendars;
    return CalendarsPage;
  },
  name: "Calendars",
});

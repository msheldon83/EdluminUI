import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "../app-chrome";
import { defineSubRoute } from "../definition";

export const CalendarEventReasonsRoute = defineSubRoute(
  AdminChromeRoute,
  "/calendar/event-reasons"
);

export const CalendarEventReasonsLoader = asyncComponent({
  resolve: async () => {
    const CalendarEventReasonsPage = (
      await import("ui/pages/calendar-event-reasons/index")
    ).CalendarEventReasons;
    return CalendarEventReasonsPage;
  },
  name: "CalendarEventReasons",
});

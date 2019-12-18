import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "../app-chrome";
import { defineSubRoute } from "../definition";

export const CalendarChangeReasonsRoute = defineSubRoute(
  AdminChromeRoute,
  "/calendar/event-reasons"
);

export const CalendarChangeReasonsLoader = asyncComponent({
  resolve: async () => {
    const CalendarChangeReasonsPage = (
      await import("ui/pages/calendar-event-reasons/index")
    ).CalendarChangeReasons;
    return CalendarChangeReasonsPage;
  },
  name: "CalendarEventReasons",
});

// Index View
export const CalendarChangeReasonsIndexRoute = defineSubRoute(
  CalendarChangeReasonsRoute,
  "/:calendarChangeReasonId",
  ["calendarChangeReasonId"]
);

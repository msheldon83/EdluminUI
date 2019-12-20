import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "../app-chrome";
import { defineSubRoute } from "../definition";

export const CalendarChangeReasonRoute = defineSubRoute(
  AdminChromeRoute,
  "/calendar/event-reasons"
);

export const CalendarChangeReasonLoader = asyncComponent({
  resolve: async () => {
    const CalendarChangeReasonPage = (
      await import("ui/pages/calendar-event-reasons/index")
    ).CalendarChangeReason;
    return CalendarChangeReasonPage;
  },
  name: "CalendarEventReasons",
});

// Index View
export const CalendarChangeReasonIndexRoute = defineSubRoute(
  CalendarChangeReasonRoute,
  "/:calendarChangeReasonId",
  ["calendarChangeReasonId"]
);

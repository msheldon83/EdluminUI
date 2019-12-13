import { asyncComponent } from "ui/async-component";
import { EmployeeChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const EmployeeScheduleRoute = defineSubRoute(
  EmployeeChromeRoute,
  "/schedule"
);

export const EmployeeScheduleListViewRoute = defineSubRoute(
  EmployeeScheduleRoute,
  "/list-view"
);
export const EmployeeScheduleCalendarViewRoute = defineSubRoute(
  EmployeeScheduleRoute,
  "/calendar-view"
);

export const EmployeeScheduleLoader = asyncComponent({
  resolve: async () => {
    const EmployeeSchedule = (await import("ui/pages/employee-schedule/index"))
      .EmployeeSchedule;
    return EmployeeSchedule;
  },
  name: "EmployeeSchedule",
});

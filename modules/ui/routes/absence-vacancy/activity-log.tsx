import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "../app-chrome";
import { defineSubRoute } from "../definition";

export const AbsenceActivityLogRoute = defineSubRoute(
  AdminChromeRoute,
  "absence/activity/:absenceId",
  ["absenceId"]
);

export const AbsenceActivityLogLoader = asyncComponent({
  async resolve() {
    return (await import("ui/pages/edit-absence/absence-activity-log"))
      .AbsenceActivityLog;
  },
});

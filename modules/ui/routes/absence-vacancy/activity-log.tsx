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
    return (await import("ui/pages/absence/edit/absence-activity-log"))
      .AbsenceActivityLog;
  },
});

export const VacancyActivityLogRoute = defineSubRoute(
  AdminChromeRoute,
  "vacancy/activity/:vacancyId",
  ["vacancyId"]
);

export const VacancyActivityLogLoader = asyncComponent({
  async resolve() {
    return (await import("ui/pages/vacancy/vacancy-activity-log"))
      .VacancyActivityLog;
  },
});

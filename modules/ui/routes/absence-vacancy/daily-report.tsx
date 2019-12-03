import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "../app-chrome";
import { defineSubRoute } from "../definition";

export const AbsenceVacancyDailyReportRoute = defineSubRoute(
  AdminChromeRoute,
  "/absence-vacancy/daily-report"
);

export const AbsenceVacancyDailyReportLoader = asyncComponent({
  resolve: async () => {
    const AbsenceVacancyDailyReportPage = (
      await import("ui/pages/absence-vacancy-daily-report/index")
    ).AbsenceVacancyDailyReport;
    return AbsenceVacancyDailyReportPage;
  },
  name: "AbsenceVacancyDailyReport",
});

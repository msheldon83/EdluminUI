import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "../app-chrome";
import { defineSubRoute } from "../definition";

export const DailyReportRoute = defineSubRoute(
  AdminChromeRoute,
  "/absence-vacancy/daily-report"
);

export const DailyReportLoader = asyncComponent({
  resolve: async () => {
    const DailyReportPage = (await import("ui/pages/reports/daily-report"))
      .DailyReportPage;
    return DailyReportPage;
  },
  name: "DailyReport",
});

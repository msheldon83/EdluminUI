import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const AnalyticsReportsRoute = defineSubRoute(
  AdminChromeRoute,
  "/reports"
);

export const AnalyticsReportsDailyReportRoute = defineSubRoute(
  AnalyticsReportsRoute,
  "/daily-report",
  []
);

export const AnalyticsReportsDailyReportLoader = asyncComponent({
  resolve: async () => {
    const DailyReportPage = (await import("ui/pages/reports/daily-report"))
      .DailyReportPage;
    return DailyReportPage;
  },
  name: "DailyReport",
});

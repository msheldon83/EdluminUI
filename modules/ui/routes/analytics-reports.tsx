import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const AnalyticsReportsRoute = defineSubRoute(
  AdminChromeRoute,
  "/reports"
);

// Daily Report
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

// Absent Employee Report
export const AnalyticsReportsAbsentEmployeeRoute = defineSubRoute(
  AnalyticsReportsRoute,
  "/absent-employee",
  []
);

export const AnalyticsReportsAbsentEmployeeLoader = asyncComponent({
  resolve: async () => {
    const AbsentEmployeeReport = (
      await import("ui/pages/reports/absent-employee")
    ).AbsentEmployeeReport;
    return AbsentEmployeeReport;
  },
  name: "AbsentEmployeeReport",
});

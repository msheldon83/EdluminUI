import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

// Reports List Page
export const AnalyticsReportsRoute = defineSubRoute(
  AdminChromeRoute,
  "/reports"
);

export const AnalyticsReportsLoader = asyncComponent({
  resolve: async () => {
    const ReportsPage = (await import("ui/pages/reports")).ReportsPage;
    return ReportsPage;
  },
  name: "Reports",
});

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

// Absences & Vacancies Report
export const AnalyticsReportsAbsencesVacanciesRoute = defineSubRoute(
  AnalyticsReportsRoute,
  "/absences-vacancies",
  []
);

export const AnalyticsReportsAbsencesVacanciesLoader = asyncComponent({
  resolve: async () => {
    const AbsencesVacanciesReport = (
      await import("ui/pages/reports/absences-vacancies")
    ).AbsencesVacanciesReport;
    return AbsencesVacanciesReport;
  },
  name: "AbsencesVacanciesReport",
});

// Substitute History Report
export const AnalyticsReportsSubHistoryRoute = defineSubRoute(
  AnalyticsReportsRoute,
  "/substitute-history",
  []
);

export const AnalyticsReportsSubHistoryLoader = asyncComponent({
  resolve: async () => {
    const SubstituteHistoryReport = (
      await import("ui/pages/reports/sub-history")
    ).SubstituteHistoryReport;
    return SubstituteHistoryReport;
  },
  name: "SubstituteHistoryReport",
});

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

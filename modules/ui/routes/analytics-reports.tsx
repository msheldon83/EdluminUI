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

// Employee Roster Report
export const AnalyticsReportsEmployeeRosterRoute = defineSubRoute(
  AnalyticsReportsRoute,
  "/employee-roster",
  []
);

export const AnalyticsReportsEmployeeRosterLoader = asyncComponent({
  resolve: async () => {
    const EmployeeRosterReport = (
      await import("ui/pages/reports/employee-roster")
    ).EmployeeRosterReport;
    return EmployeeRosterReport;
  },
  name: "EmployeeRosterReport",
});

// Substitute Roster Report
export const AnalyticsReportsSubstituteRosterRoute = defineSubRoute(
  AnalyticsReportsRoute,
  "/substitute-roster",
  []
);

export const AnalyticsReportsSubstituteRosterLoader = asyncComponent({
  resolve: async () => {
    const SubstituteRosterReport = (
      await import("ui/pages/reports/substitute-roster")
    ).SubstituteRosterReport;
    return SubstituteRosterReport;
  },
  name: "SubstituteRosterReport",
});

// Employee Balances Report
export const AnalyticsReportsEmployeeBalancesRoute = defineSubRoute(
  AnalyticsReportsRoute,
  "/employee-balances",
  []
);

export const AnalyticsReportsEmployeeBalancesLoader = asyncComponent({
  resolve: async () => {
    const EmployeeBalancesReport = (
      await import("ui/pages/reports/employee-balances")
    ).EmployeeBalancesReport;
    return EmployeeBalancesReport;
  },
  name: "EmployeeBalancesReport",
});

// Absences & Vacancies Detail Report
export const AnalyticsReportsAbsencesVacanciesDetailRoute = defineSubRoute(
  AnalyticsReportsRoute,
  "/absence-vacancies-detail",
  []
);

export const AnalyticsReportsAbsencesVacanciesDetailLoader = asyncComponent({
  resolve: async () => {
    const AbsencesVacanciesDetailReport = (
      await import("ui/pages/reports/absences-vacancies-detail")
    ).AbsencesVacanciesDetailReport;
    return AbsencesVacanciesDetailReport;
  },
  name: "AbsencesVacanciesDetailReport",
});

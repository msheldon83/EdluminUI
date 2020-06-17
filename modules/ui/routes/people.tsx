import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const PeopleRoute = defineSubRoute(AdminChromeRoute, "/people");

export enum QueryParamKeys {
  name = "name",
  acitve = "active",
}

export type QueryParams = {
  name: string;
  active: boolean;
};

// Add Admin
export const AdminAddRoute = defineSubRoute(
  PeopleRoute,
  "/add-admin/:orgUserId",
  ["orgUserId"]
);
export const AdminAddLoader = asyncComponent({
  resolve: async () => {
    const AdminAddPage = (await import("ui/pages/people/components/admin/add"))
      .AdminAddPage;
    return AdminAddPage;
  },
  name: "AdminAddPage",
});

// Add Employee
export const EmployeeAddRoute = defineSubRoute(
  PeopleRoute,
  "/add-employee/:orgUserId",
  ["orgUserId"]
);
export const EmployeeAddLoader = asyncComponent({
  resolve: async () => {
    const EmployeeAddPage = (
      await import("ui/pages/people/components/employee/add")
    ).EmployeeAddPage;
    return EmployeeAddPage;
  },
  name: "EmployeeAddPage",
});

// Add Substitute
export const SubstituteAddRoute = defineSubRoute(
  PeopleRoute,
  "/add-substitute/:orgUserId",
  ["orgUserId"]
);
export const SubstituteAddLoader = asyncComponent({
  resolve: async () => {
    const SubstituteAddPage = (
      await import("ui/pages/people/components/substitute/add")
    ).SubstituteAddPage;
    return SubstituteAddPage;
  },
  name: "SubstituteAddPage",
});

// View
export const PersonViewRoute = defineSubRoute(PeopleRoute, "/:orgUserId", [
  "orgUserId",
]);
export const PersonViewLoader = asyncComponent({
  resolve: async () => {
    const PersonViewPage = (await import("ui/pages/people/view"))
      .PersonViewPage;
    return PersonViewPage;
  },
  name: "PersonViewPage",
});

export const PeopleLoader = asyncComponent({
  resolve: async () => {
    const PeoplePage = (await import("ui/pages/people")).PeoplePage;
    return PeoplePage;
  },
  name: "People",
});

/***** employee abs schedule *****/

export const EmployeeAbsScheduleRoute = defineSubRoute(
  PersonViewRoute,
  "/schedule"
);

export const EmployeeAbsScheduleListViewRoute = defineSubRoute(
  EmployeeAbsScheduleRoute,
  "/list-view"
);
export const EmployeeAbsScheduleCalendarViewRoute = defineSubRoute(
  EmployeeAbsScheduleRoute,
  "/calendar-view"
);

export const EmployeeAbsScheduleLoader = asyncComponent({
  resolve: async () => {
    const EmployeeAbsSchedulePage = (
      await import("ui/pages/people/employee-abs-schedule")
    ).EmployeeAbsenceSchedulePage;
    return EmployeeAbsSchedulePage;
  },
  name: "EmployeeAbsSchedulePage",
});

/**** substitute edit pages ****/

export const PeopleSubPositionsAttributesEditRoute = defineSubRoute(
  PersonViewRoute,
  "/edit-positions-attributes"
);
export const PeopleSubPositionsAttributesEditLoader = asyncComponent({
  resolve: async () => {
    const SubPositionsAttributes = (
      await import("ui/pages/sub-positions-attributes")
    ).SubPositionsAttributes;
    return SubPositionsAttributes;
  },
  name: "SubPositionsAttributes",
});

export const PeopleSubPoolEditRoute = defineSubRoute(
  PersonViewRoute,
  "/edit-sub-pools"
);
export const PeopleSubPoolEditLoader = asyncComponent({
  resolve: async () => {
    const SubPool = (await import("ui/pages/sub-pools")).SubPool;
    return SubPool;
  },
  name: "SubPool",
});

/**** admin edit page****/
//Edit Admin Related Orgs
export const PeopleAdminRelatedOrgsEditRoute = defineSubRoute(
  PersonViewRoute,
  "/edit-admin-orgs"
);
export const PeopleAdminRelatedOrgsEditLoader = asyncComponent({
  resolve: async () => {
    const AdminRelatedOrgsEditPage = (
      await import("ui/pages/admin-related-orgs")
    ).AdminRelatedOrgsEditPage;
    return AdminRelatedOrgsEditPage;
  },
  name: "AdminRelatedOrgs",
});

//Edit Replacement Criteria
export const PeopleReplacementCriteriaEditRoute = defineSubRoute(
  PersonViewRoute,
  "/replacement-criteria"
);

export const PeopleReplacementCriteriaEditLoader = asyncComponent({
  resolve: async () => {
    const PeopleReplacementCriteriaEdit = (
      await import(
        "ui/pages/people/components/employee/edit-replacement-criteria"
      )
    ).PeopleReplacementCriteriaEdit;
    return PeopleReplacementCriteriaEdit;
  },
  name: "PeopleReplacementCriteriaEditSettingsPage",
});

// Edit Employee Position
export const PeopleEmployeePositionEditRoute = defineSubRoute(
  PersonViewRoute,
  "/edit-position"
);
export const PeopleEmployeePositionEditLoader = asyncComponent({
  resolve: async () => {
    const EmployeePosition = (await import("ui/pages/employee-position"))
      .EmployeePosition;
    return EmployeePosition;
  },
  name: "EmployeePosition",
});

// Edit Employee Balances
export const PeopleEmployeeBalancesEditRoute = defineSubRoute(
  PersonViewRoute,
  "/edit-balances"
);
export const PeopleEmployeeBalancesEditLoader = asyncComponent({
  resolve: async () => {
    const EditEmployeeBalances = (
      await import("ui/pages/edit-employee-balances")
    ).EditEmployeePtoBalances;
    return EditEmployeeBalances;
  },
  name: "EmployeeBalances",
});

//Edit Sub Related Orgs
export const PeopleSubRelatedOrgsEditRoute = defineSubRoute(
  PersonViewRoute,
  "/edit-sub-orgs"
);
export const PeopleSubRelatedOrgsEditLoader = asyncComponent({
  resolve: async () => {
    const SubRelatedOrgsEditPage = (await import("ui/pages/sub-related-orgs"))
      .SubRelatedOrgsEditPage;
    return SubRelatedOrgsEditPage;
  },
  name: "SubRelatedOrgs",
});

/***** substitute assignment schedule *****/

export const SubstituteAssignmentScheduleRoute = defineSubRoute(
  PersonViewRoute,
  "/assignments/schedule"
);

export const SubstituteAssignmentScheduleListViewRoute = defineSubRoute(
  SubstituteAssignmentScheduleRoute,
  "/list-view"
);
export const SubstituteAssignmentScheduleCalendarViewRoute = defineSubRoute(
  SubstituteAssignmentScheduleRoute,
  "/calendar-view"
);

export const SubstituteAssignmentScheduleLoader = asyncComponent({
  resolve: async () => {
    const SubstituteAssignmentSchedulePage = (
      await import("ui/pages/people/substitute-assignments-schedule")
    ).SubstituteAssignmentsSchedulePage;
    return SubstituteAssignmentSchedulePage;
  },
  name: "EmployeeAbsSchedulePage",
});

export const SubstituteAvailableAssignmentsRoute = defineSubRoute(
  PersonViewRoute,
  "/available-assignments"
);

export const SubstituteAvailableAssignmentsLoader = asyncComponent({
  resolve: async () => {
    const SubstituteAvailableAssignmentsPage = (
      await import("ui/pages/people/substitute-available-assignments")
    ).SubstituteAvailableAssignmentsPage;
    return SubstituteAvailableAssignmentsPage;
  },
  name: "SubstituteAvailableAssignmentsPage",
});

/***** employee sub preferences *****/

export const EmployeeSubstitutePreferenceRoute = defineSubRoute(
  PersonViewRoute,
  "/substitute-preferences"
);

export const EmployeeSubstitutePreferenceLoader = asyncComponent({
  resolve: async () => {
    const EmployeeSubstitutePreferencePage = (
      await import("ui/pages/people/employee-substitute-preferences")
    ).EmployeeSubstitutePreferencePage;
    return EmployeeSubstitutePreferencePage;
  },
  name: "EmployeeSubstitutePreferencePage",
});

/***** employee balance report *****/

export const EmployeeBalanceReportRoute = defineSubRoute(
  PersonViewRoute,
  "/employee-balance-report"
);

export const EmployeeBalanceReportLoader = asyncComponent({
  resolve: async () => {
    const EmployeeBalanceReportPage = (
      await import("ui/pages/reports/employee-balance")
    ).EmployeeBalanceReport;
    return EmployeeBalanceReportPage;
  },
  name: "EmployeeBalanceReportPage",
});

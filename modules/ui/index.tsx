import { hot } from "react-hot-loader/root";
import { CssBaseline } from "@material-ui/core";
import { makeStyles, ThemeProvider } from "@material-ui/styles";
import * as React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { AppChrome } from "./app-chrome";
import { IfAuthenticated } from "./components/auth/if-authenticated";
import { RedirectToLogin } from "./components/auth/redirect-to-login";
import { LoginPageRouteLoader } from "./pages/login/loader";
import { IndexLoader } from "./routes";
import {
  DailyReportLoader,
  DailyReportRoute,
} from "./routes/absence-vacancy/daily-report";
import {
  AbsenceVacancyRulesLoader,
  AbsenceVacancyRulesRoute,
} from "./routes/absence-vacancy/rules";
import {
  VerifyOverviewLoader,
  VerifyOverviewRoute,
  VerifyDailyLoader,
  VerifyDailyRoute,
} from "./routes/absence-vacancy/verify";
import {
  AbsenceReasonLoader,
  AbsenceReasonRoute,
  AbsenceReasonAddRoute,
  AbsenceReasonAddLoader,
  AbsenceReasonViewEditRoute,
  AbsenceReasonViewEditLoader,
  AbsenceReasonEditSettingsRoute,
  AbsenceReasonEditSettingsLoader,
  AbsenceReasonCategoryAddLoader,
  AbsenceReasonCategoryAddRoute,
  AbsenceReasonCategoryViewEditRoute,
  AbsenceReasonCategoryViewEditLoader,
  AbsenceReasonCategoryEditSettingsLoader,
  AbsenceReasonCategoryEditSettingsRoute,
} from "./routes/absence-reason";
import {
  AccountingCodeLoader,
  AccountingCodeRoute,
} from "./routes/accounting-code";
import { AdminHomeLoader, AdminHomeRoute } from "./routes/admin-home";
import {
  AbsenceApprovalWorkflowRoute,
  AbsenceApprovalWorkflowLoader,
  VacancyApprovalWorkflowRoute,
  VacancyApprovalWorkflowLoader,
  ApprovalWorkflowEditRoute,
  ApprovalWorkflowEditLoader,
  AbsenceApprovalWorkflowAddRoute,
  AbsenceApprovalWorkflowAddLoader,
  VacancyApprovalWorkflowAddRoute,
  VacancyApprovalWorkflowAddLoader,
} from "./routes/approval-workflow";
import {
  ApprovalInboxRoute,
  ApprovalInboxLoader,
} from "./routes/approval-inbox";
import {
  AdminRootChromeRoute,
  AppChromeRoute,
  EmployeeChromeRoute,
  SubstituteChromeRoute,
  AdminChromeRoute,
} from "./routes/app-chrome";
import {
  BellScheduleAddLoader,
  BellScheduleAddRoute,
  BellScheduleLoader,
  BellScheduleRoute,
  BellScheduleViewLoader,
  BellScheduleViewRoute,
} from "./routes/bell-schedule";
import {
  BellScheduleVariantsLoader,
  BellScheduleVariantsRoute,
} from "./routes/bell-schedule-variants";
import { HoursToDaysLoader, HoursToDaysRoute } from "./routes/hours-to-days";
import {
  CalendarChangeReasonLoader,
  CalendarChangeReasonRoute,
} from "./routes/calendar/event-reasons";
import {
  CalendarRoute,
  CalendarsLoader,
  CalendarListViewRoute,
  CalendarCalendarViewRoute,
} from "./routes/calendar/calendar";
import { ContractsLoader, ContractsRoute } from "./routes/contracts";
import {
  AbsenceActivityLogRoute,
  AbsenceActivityLogLoader,
  VacancyActivityLogRoute,
  VacancyActivityLogLoader,
} from "./routes/absence-vacancy/activity-log";
import { EmployeeHomeLoader, EmployeeHomeRoute } from "./routes/employee-home";
import {
  GeneralSettingsLoader,
  GeneralSettingsRoute,
} from "./routes/general-settings";
import { SettingsLoader, SettingsRoute } from "./routes/settings";
import {
  AnalyticsReportsRoute,
  AnalyticsReportsLoader,
  AnalyticsReportsDailyReportRoute,
  AnalyticsReportsDailyReportLoader,
  AnalyticsReportsAbsencesVacanciesRoute,
  AnalyticsReportsAbsencesVacanciesLoader,
  AnalyticsReportsSubHistoryRoute,
  AnalyticsReportsSubHistoryLoader,
  AnalyticsReportsEmployeeRosterRoute,
  AnalyticsReportsEmployeeRosterLoader,
  AnalyticsReportsSubstituteRosterRoute,
  AnalyticsReportsSubstituteRosterLoader,
  AnalyticsReportsEmployeeBalancesRoute,
  AnalyticsReportsEmployeeBalancesLoader,
  AnalyticsReportsAbsencesVacanciesDetailRoute,
  AnalyticsReportsAbsencesVacanciesDetailLoader,
} from "./routes/analytics-reports";
import {
  OrganizationsLoader,
  OrganizationsRoute,
  OrganizationAddRoute,
  OrganizationContactInfoLoader,
  OrganizationContactInfoRoute,
  OrganizationAddLoader,
} from "./routes/organizations";
import { PayCodeLoader, PayCodeRoute } from "./routes/pay-code";
import {
  PeopleLoader,
  PeopleRoute,
  AdminAddRoute,
  AdminAddLoader,
  EmployeeAddRoute,
  EmployeeAddLoader,
  SubstituteAddRoute,
  SubstituteAddLoader,
  PersonViewLoader,
  PeopleSubPoolEditLoader,
  PeopleSubPoolEditRoute,
  PeopleReplacementCriteriaEditLoader,
  PeopleReplacementCriteriaEditRoute,
  PeopleEmployeePositionEditLoader,
  PeopleEmployeePositionEditRoute,
  PersonViewRoute,
  EmployeeAbsScheduleLoader,
  EmployeeAbsScheduleRoute,
  EmployeeAbsScheduleCalendarViewRoute,
  EmployeeAbsScheduleListViewRoute,
  SubstituteAssignmentScheduleLoader,
  SubstituteAssignmentScheduleRoute,
  SubstituteAssignmentScheduleCalendarViewRoute,
  SubstituteAssignmentScheduleListViewRoute,
  PeopleSubRelatedOrgsEditRoute,
  PeopleSubRelatedOrgsEditLoader,
  PeopleSubPositionsAttributesEditRoute,
  PeopleSubPositionsAttributesEditLoader,
  EmployeeSubstitutePreferenceRoute,
  EmployeeSubstitutePreferenceLoader,
  EmployeeBalanceReportRoute,
  EmployeeBalanceReportLoader,
  PeopleEmployeeBalancesEditRoute,
  PeopleEmployeeBalancesEditLoader,
  SubstituteAvailableAssignmentsRoute,
  SubstituteAvailableAssignmentsLoader,
  SubstituteLocationPreferencesRoute,
  SubstituteLocationPreferencesLoader,
  PeopleAdminRelatedOrgsEditRoute,
  PeopleAdminRelatedOrgsEditLoader,
} from "./routes/people";
import {
  PositionTypeAddLoader,
  PositionTypeAddRoute,
  PositionTypeEditSettingsLoader,
  PositionTypeEditSettingsRoute,
  PositionTypeLoader,
  PositionTypeRoute,
  PositionTypeViewLoader,
  PositionTypeViewRoute,
  ReplacementCriteriaEditLoader,
  ReplacementCriteriaEditRoute,
} from "./routes/position-type";
import {
  ProfileLoader,
  ProfileRoute,
  AdminProfileRoute,
} from "./routes/profile";
import {
  ReplacementAttributeLoader,
  ReplacementAttributeRoute,
} from "./routes/replacement-attribute";
import {
  LocationGroupsLoader,
  LocationGroupsRoute,
  LocationGroupViewLoader,
  LocationGroupViewRoute,
  LocationGroupSubPrefLoader,
  LocationGroupSubPrefRoute,
  LocationGroupAddLoader,
  LocationGroupAddRoute,
} from "./routes/location-groups";
import {
  ApproverGroupsRoute,
  ApproverGroupsLoader,
  ApproverGroupAddRoute,
  ApproverGroupAddLoader,
  ApproverGroupAddLocationsRoute,
  ApproverGroupAddLocationsLoader,
  ApproverGroupAddRemoveMembersRoute,
  ApproverGroupAddRemoveMembersLoader,
} from "./routes/approver-groups";
import {
  LocationsLoader,
  LocationAddLoader,
  LocationAddRoute,
  LocationEditSettingsLoader,
  LocationEditSettingsRoute,
  LocationsRoute,
  LocationViewLoader,
  LocationViewRoute,
  LocationSubPrefLoader,
  LocationSubPrefRoute,
} from "./routes/locations";
import {
  SecurityManagedOrganizationsLoader,
  SecurityManagedOrganizationsRoute,
} from "./routes/security/managed-organizations";
import {
  SecurityPartnersLoader,
  SecurityPartnersRoute,
} from "./routes/security/partners";
import {
  SecurityPermissionSetsLoader,
  SecurityPermissionSetsRoute,
  SecurityPermissionSetsAddLoader,
  SecurityPermissionSetsAddRoute,
  SecurityPermissionSetsViewLoader,
  SecurityPermissionSetsViewRoute,
} from "./routes/security/permission-sets";
import { SubHomeLoader, SubHomeRoute } from "./routes/sub-home";
import {
  SubPreferencesLoader,
  SubPreferencesRoute,
  SubPreferencesEditLoader,
  SubPreferencesEditRoute,
} from "./routes/sub-preferences";
import {
  SubSpecificOpportunityLoader,
  SubSpecificOpportunityRoute,
} from "./routes/sub-specific-opportunity";
import {
  SubSpecificAssignmentLoader,
  SubSpecificAssignmentRoute,
} from "./routes/sub-specific-assignment";
import {
  SubScheduleCalendarViewRoute,
  SubScheduleListViewRoute,
  SubScheduleLoader,
  SubScheduleRoute,
  SubAvailabilityRoute,
  SubAvailabilityLoader,
} from "./routes/sub-schedule";
import {
  SubstituteSettingsLoader,
  SubstituteSettingsRoute,
} from "./routes/substitute-settings";
import {
  VacancyReasonLoader,
  VacancyReasonRoute,
} from "./routes/vacancy-reason";
import { EdluminTheme } from "./styles/mui-theme";
import {
  EmployeeScheduleCalendarViewRoute,
  EmployeeScheduleLoader,
  EmployeeScheduleListViewRoute,
  EmployeeScheduleRoute,
} from "./routes/employee-schedule";
import {
  EmployeeSubPreferenceRoute,
  EmployeeSubPreferenceRouteLoader,
} from "./routes/employee-sub-preferences";
import {
  EmployeePtoBalanceRoute,
  EmployeePtoBalanceLoader,
} from "./routes/employee-pto-balances";
import { SubSignInRoute, SubSignInLoader } from "ui/routes/sub-sign-in";
import { OrgUserRole, PermissionEnum } from "graphql/server-types.gen";
import { IfHasRole } from "./components/auth/if-has-role";
import { ProtectedRoute } from "./components/routing/protected-route";
import {
  UnauthorizedRoute,
  UnauthorizedAdminRoleRoute,
  UnauthorizedEmployeeRoleRoute,
  UnauthorizedSubstituteRoleRoute,
  UnauthorizedLoader,
} from "./routes/unauthorized";
import {
  NotFoundRoute,
  NotFoundAdminRootRoute,
  NotFoundAdminRoleRoute,
  NotFoundEmployeeRoleRoute,
  NotFoundSubstituteRoleRoute,
  NotFoundLoader,
} from "./routes/not-found";
import { tbd, TbdLoader, adminTbd } from "./routes/tbd";
import { AdminRouteOrganizationContextProvider } from "core/org-context";
import {
  AdminMobileSearchLoader,
  AdminMobileSearchRoute,
  EmpMobileSearchRoute,
  EmployeeMobileSearchLoader,
  SubMobileSearchRoute,
  SubstituteMobileSearchLoader,
} from "ui/routes/mobile-search";
import {
  UsersRoute,
  UsersLoader,
  UserViewLoader,
  UserViewRoute,
} from "./routes/users";
import {
  VacancyCreateRoute,
  VacancyCreateLoader,
  VacancyViewLoader,
  VacancyViewRoute,
  VacancyApprovalViewLoader,
  VacancyApprovalViewRoute,
} from "./routes/vacancy";
import {
  AbsenceVacancyNotificationLogRoute,
  VacancyNotificationLogRoute,
  VacancyNotificationLogLoader,
  UserNotificationLogRoute,
  UserNotificationLogLoader,
} from "./routes/notification-log";
import { UserSmsLogRoute, UserSmsLogLoader } from "./routes/sms-log";
import { AppConfigProvider } from "hooks/app-config";
import {
  endImpersonationRoute,
  EndImpersonationLoader,
} from "./routes/end-impersonate";
import {
  DataImportRoute,
  DataImportLoader,
  DataImportViewRoute,
  DataImportViewLoader,
  DataImportColumnDefinitionsRoute,
  DataImportColumnDefinitionsLoader,
} from "./routes/data-import";
import {
  IntegrationRoute,
  IntegrationLoader, 
  IntegrationViewRoute, 
  IntegrationViewLoader,
} from "./routes/integration"
import { RoleContextProvider } from "core/role-context";
import {
  CreateAbsenceLoader,
  AdminCreateAbsenceRoute,
  SelectEmployeeForCreateAbsenceLoader,
  AdminSelectEmployeeForCreateAbsenceRoute,
  AdminEditAbsenceRoute,
  EmployeeCreateAbsenceLoader,
  EmployeeCreateAbsenceRoute,
  EmployeeEditAbsenceRoute,
  EditAbsenceLoader,
  EmployeeCreateAbsenceConfirmationLoader,
  EmployeeCreateAbsenceConfirmationRoute,
  EmployeeAbsenceApprovalViewRoute,
  AbsenceApprovalViewLoader,
  AdminAbsenceApprovalViewRoute,
} from "./routes/absence";
import { AdminFeedbackRoute, FeedbackLoader } from "./routes/feedback";
/** Build the core app store with middlewares and reducer. Used to bootstrap the app to run and to test. */

export const App = hot(function() {
  const classes = useStyles();

  return (
    <ThemeProvider theme={EdluminTheme}>
      <AppConfigProvider>
        <CssBaseline />
        <div className={classes.container}>
          <div className={classes.main}>
            <Switch>
              <Route exact path={"/login"} component={LoginPageRouteLoader} />
              <Route exact path={"/"}>
                <IfAuthenticated>
                  <Route exact component={IndexLoader} path={"/"} />
                </IfAuthenticated>
                <IfAuthenticated not>
                  <RedirectToLogin />
                </IfAuthenticated>
              </Route>
              <Route
                exact
                component={UnauthorizedLoader}
                path={UnauthorizedRoute.path}
              />
              <Route component={NotFoundLoader} path={NotFoundRoute.path} />
              <Route path={SubSignInRoute.path}>
                <AdminRouteOrganizationContextProvider>
                  <IfAuthenticated>
                    <IfHasRole role={OrgUserRole.Administrator}>
                      <ProtectedRoute
                        component={SubSignInLoader}
                        path={SubSignInRoute.path}
                        role={"admin"}
                      />
                    </IfHasRole>
                  </IfAuthenticated>
                  <IfAuthenticated not>
                    <RedirectToLogin />
                  </IfAuthenticated>
                </AdminRouteOrganizationContextProvider>
              </Route>
              <Route path={AppChromeRoute.path}>
                <RoleContextProvider>
                  <IfAuthenticated>
                    <AppChrome>
                      <Switch>
                        {/* Protected routes go here */}

                        <Route
                          component={ProfileLoader}
                          path={ProfileRoute.path}
                        />
                        <Route
                          component={OrganizationContactInfoLoader}
                          path={OrganizationContactInfoRoute.path}
                        />
                        <Route
                          exact
                          path={endImpersonationRoute.path}
                          component={EndImpersonationLoader}
                        />
                        {/* Page under construction */}
                        <Route component={TbdLoader} path={tbd.path} />

                        {/* Employee routes go here */}
                        <Route path={EmployeeChromeRoute.path}>
                          <IfHasRole role={OrgUserRole.Employee}>
                            <Switch>
                              <Route
                                component={UnauthorizedLoader}
                                path={UnauthorizedEmployeeRoleRoute.path}
                              />
                              <Route
                                component={
                                  EmployeeCreateAbsenceConfirmationLoader
                                }
                                path={
                                  EmployeeCreateAbsenceConfirmationRoute.path
                                }
                              />
                              <Route
                                component={EmployeeCreateAbsenceLoader}
                                path={EmployeeCreateAbsenceRoute.path}
                              />
                              <Route path={EmployeeEditAbsenceRoute.path}>
                                <EditAbsenceLoader actingAsEmployee />
                              </Route>
                              <ProtectedRoute
                                path={EmployeeAbsenceApprovalViewRoute.path}
                                role={"employee"}
                                permissions={[
                                  PermissionEnum.AbsVacApprovalsView,
                                ]}
                              >
                                <AbsenceApprovalViewLoader actingAsEmployee />
                              </ProtectedRoute>
                              <ProtectedRoute
                                component={EmployeePtoBalanceLoader}
                                path={EmployeePtoBalanceRoute.path}
                                role={"employee"}
                                permissions={[
                                  PermissionEnum.EmployeeViewBalances,
                                ]}
                              />
                              <Route
                                path={EmployeeSubPreferenceRoute.path}
                                component={EmployeeSubPreferenceRouteLoader}
                              />

                              <Route
                                path={EmployeeScheduleCalendarViewRoute.path}
                              >
                                <EmployeeScheduleLoader view="calendar" />
                              </Route>
                              <Route path={EmployeeScheduleListViewRoute.path}>
                                <EmployeeScheduleLoader view="list" />
                              </Route>
                              <Route path={EmployeeScheduleRoute.path}>
                                <EmployeeScheduleLoader view="list" />
                              </Route>
                              <Route
                                path={EmpMobileSearchRoute.path}
                                component={EmployeeMobileSearchLoader}
                              />
                              {/* The following two routes must be the last two in this switch.  
                              This first will match exactly and send the employee to the home page.  
                              The second will send any unfound routes to the not found page.*/}
                              <Route
                                exact
                                component={EmployeeHomeLoader}
                                path={EmployeeHomeRoute.path}
                              />
                              <Route
                                path={EmployeeHomeRoute.path}
                                component={NotFoundLoader}
                              />
                            </Switch>
                          </IfHasRole>
                          <IfHasRole role={OrgUserRole.Employee} not>
                            <Redirect to={UnauthorizedRoute.generate({})} />
                          </IfHasRole>
                        </Route>

                        {/* Sub routes go here */}
                        <Route path={SubstituteChromeRoute.path}>
                          <IfHasRole role={OrgUserRole.ReplacementEmployee}>
                            <Switch>
                              <Route
                                component={UnauthorizedLoader}
                                path={UnauthorizedSubstituteRoleRoute.path}
                              />
                              <Route
                                component={SubAvailabilityLoader}
                                path={SubAvailabilityRoute.path}
                              />
                              <Route path={SubScheduleCalendarViewRoute.path}>
                                <SubScheduleLoader view="calendar" />
                              </Route>
                              <Route path={SubScheduleListViewRoute.path}>
                                <SubScheduleLoader view="list" />
                              </Route>
                              <Route path={SubScheduleRoute.path}>
                                <SubScheduleLoader view="list" />
                              </Route>
                              <Route
                                component={SubPreferencesEditLoader}
                                path={SubPreferencesEditRoute.path}
                              />
                              <Route
                                component={SubPreferencesLoader}
                                path={SubPreferencesRoute.path}
                              />
                              <Route
                                component={SubSpecificOpportunityLoader}
                                path={SubSpecificOpportunityRoute.path}
                              />
                              <Route
                                component={SubSpecificAssignmentLoader}
                                path={SubSpecificAssignmentRoute.path}
                              />
                              <Route
                                path={SubMobileSearchRoute.path}
                                component={SubstituteMobileSearchLoader}
                              />
                              {/* The following two routes must be the last two in this switch.
                              This first will match exactly and send the substitute to the home page.
                              The second will send any unfound routes to the not found page.*/}
                              <Route
                                exact
                                component={SubHomeLoader}
                                path={SubHomeRoute.path}
                              />
                              <Route
                                path={SubHomeRoute.path}
                                component={NotFoundLoader}
                              />
                            </Switch>
                          </IfHasRole>
                          <IfHasRole role={OrgUserRole.ReplacementEmployee} not>
                            <Redirect to={UnauthorizedRoute.generate({})} />
                          </IfHasRole>
                        </Route>

                        <Route path={AdminRootChromeRoute.path}>
                          <IfHasRole role={OrgUserRole.Administrator}>
                            {/* Admin routes go here*/}
                            <Switch>
                              {/* Admin page under construction */}
                              <Route
                                component={TbdLoader}
                                path={adminTbd.path}
                              />

                              {/*We will need to figure out how to prevent non admin users from accessing this route */}
                              <Route exact path={AdminRootChromeRoute.path}>
                                <OrganizationsLoader redirectIfOneOrg />
                              </Route>
                              <Route
                                component={OrganizationsLoader}
                                path={OrganizationsRoute.path}
                              />
                              <Route
                                component={ProfileLoader}
                                path={AdminProfileRoute.path}
                              />
                              <ProtectedRoute
                                component={OrganizationAddLoader}
                                path={OrganizationAddRoute.path}
                                role={"sysAdmin"}
                              />
                              <ProtectedRoute
                                component={UserNotificationLogLoader}
                                path={UserNotificationLogRoute.path}
                                role={"sysAdmin"}
                              />
                              <ProtectedRoute
                                component={UserSmsLogLoader}
                                path={UserSmsLogRoute.path}
                                role={"sysAdmin"}
                              />
                              <ProtectedRoute
                                component={UserViewLoader}
                                path={UserViewRoute.path}
                                role={"sysAdmin"}
                              />
                              <ProtectedRoute
                                component={UsersLoader}
                                path={UsersRoute.path}
                                role={"sysAdmin"}
                              />
                              <Route path={AdminChromeRoute.path}>
                                <AdminRouteOrganizationContextProvider>
                                  <Switch>
                                    <Route
                                      component={UnauthorizedLoader}
                                      path={UnauthorizedAdminRoleRoute.path}
                                    />
                                    <ProtectedRoute
                                      component={
                                        AbsenceApprovalWorkflowAddLoader
                                      }
                                      path={
                                        AbsenceApprovalWorkflowAddRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ApprovalSettingsSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        VacancyApprovalWorkflowAddLoader
                                      }
                                      path={
                                        VacancyApprovalWorkflowAddRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ApprovalSettingsSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={ApprovalWorkflowEditLoader}
                                      path={ApprovalWorkflowEditRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ApprovalSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={AbsenceApprovalWorkflowLoader}
                                      path={AbsenceApprovalWorkflowRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ApprovalSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={VacancyApprovalWorkflowLoader}
                                      path={VacancyApprovalWorkflowRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ApprovalSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={AbsenceApprovalViewLoader}
                                      path={AdminAbsenceApprovalViewRoute.path}
                                      role={"admin"}
                                    />
                                    <ProtectedRoute
                                      component={VacancyApprovalViewLoader}
                                      path={VacancyApprovalViewRoute.path}
                                      role={"admin"}
                                    />
                                    <ProtectedRoute
                                      component={ApprovalInboxLoader}
                                      path={ApprovalInboxRoute.path}
                                      role={"admin"}
                                    />
                                    <ProtectedRoute
                                      component={VacancyNotificationLogLoader}
                                      path={
                                        AbsenceVacancyNotificationLogRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.AbsVacViewNotificationLog,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        DataImportColumnDefinitionsLoader
                                      }
                                      path={
                                        DataImportColumnDefinitionsRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[PermissionEnum.DataImport]}
                                    />
                                    <ProtectedRoute
                                      component={DataImportViewLoader}
                                      path={DataImportViewRoute.path}
                                      role={"admin"}
                                      permissions={[PermissionEnum.DataImport]}
                                    />
                                    <ProtectedRoute
                                      component={DataImportLoader}
                                      path={DataImportRoute.path}
                                      role={"admin"}
                                      permissions={[PermissionEnum.DataImport]}
                                    />
                                    <ProtectedRoute
                                      component={IntegrationViewLoader}
                                      path={IntegrationViewRoute.path}
                                      role={"admin"}
                                      permissions={[PermissionEnum.ExternalConnectionsView]}
                                    />
                                    <ProtectedRoute
                                      component={IntegrationLoader}
                                      path={IntegrationRoute.path}
                                      role={"admin"}
                                      permissions={[PermissionEnum.ExternalConnectionsView]}
                                    />
                                    <ProtectedRoute
                                      component={EditAbsenceLoader}
                                      path={AdminEditAbsenceRoute.path}
                                      role={"admin"}
                                      permissions={[PermissionEnum.AbsVacView]}
                                    />
                                    <ProtectedRoute
                                      component={AbsenceActivityLogLoader}
                                      path={AbsenceActivityLogRoute.path}
                                      role={"admin"}
                                      permissions={[PermissionEnum.AbsVacView]}
                                    />
                                    <ProtectedRoute
                                      component={CreateAbsenceLoader}
                                      path={AdminCreateAbsenceRoute.path}
                                      role={"admin"}
                                      permissions={[PermissionEnum.AbsVacSave]}
                                    />
                                    <ProtectedRoute
                                      component={VacancyCreateLoader}
                                      path={VacancyCreateRoute.path}
                                      role={"admin"}
                                      permissions={[PermissionEnum.AbsVacSave]}
                                    />
                                    <ProtectedRoute
                                      component={VacancyActivityLogLoader}
                                      path={VacancyActivityLogRoute.path}
                                      role={"admin"}
                                      permissions={[PermissionEnum.AbsVacView]}
                                    />
                                    <ProtectedRoute
                                      component={VacancyNotificationLogLoader}
                                      path={VacancyNotificationLogRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.AbsVacViewNotificationLog,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={VacancyViewLoader}
                                      path={VacancyViewRoute.path}
                                      role={"admin"}
                                      permissions={[PermissionEnum.AbsVacView]}
                                    />
                                    <ProtectedRoute
                                      path={
                                        EmployeeSubstitutePreferenceRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.EmployeeSave,
                                      ]}
                                    >
                                      <EmployeeSubstitutePreferenceLoader />
                                    </ProtectedRoute>
                                    <ProtectedRoute
                                      path={EmployeeBalanceReportRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.EmployeeViewBalances,
                                      ]}
                                    >
                                      <EmployeeBalanceReportLoader />
                                    </ProtectedRoute>
                                    <ProtectedRoute
                                      component={
                                        SelectEmployeeForCreateAbsenceLoader
                                      }
                                      path={
                                        AdminSelectEmployeeForCreateAbsenceRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[PermissionEnum.AbsVacSave]}
                                    />
                                    <ProtectedRoute
                                      path={
                                        EmployeeAbsScheduleCalendarViewRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.EmployeeView,
                                      ]}
                                    >
                                      <EmployeeAbsScheduleLoader view="calendar" />
                                    </ProtectedRoute>

                                    <ProtectedRoute
                                      path={
                                        EmployeeAbsScheduleListViewRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.EmployeeView,
                                      ]}
                                    >
                                      <EmployeeAbsScheduleLoader view="list" />
                                    </ProtectedRoute>
                                    <ProtectedRoute
                                      component={EmployeeAbsScheduleLoader}
                                      path={EmployeeAbsScheduleRoute.path}
                                      role={"admin"}
                                    />

                                    <ProtectedRoute
                                      path={
                                        SubstituteAssignmentScheduleCalendarViewRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.SubstituteView,
                                      ]}
                                    >
                                      <SubstituteAssignmentScheduleLoader view="calendar" />
                                    </ProtectedRoute>

                                    <ProtectedRoute
                                      path={
                                        SubstituteAssignmentScheduleListViewRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.SubstituteView,
                                      ]}
                                    >
                                      <SubstituteAssignmentScheduleLoader view="list" />
                                    </ProtectedRoute>
                                    <ProtectedRoute
                                      component={
                                        SubstituteAssignmentScheduleLoader
                                      }
                                      path={
                                        SubstituteAssignmentScheduleRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.SubstituteView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        SubstituteAvailableAssignmentsLoader
                                      }
                                      path={
                                        SubstituteAvailableAssignmentsRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.SubstituteView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        SubstituteLocationPreferencesLoader
                                      }
                                      path={
                                        SubstituteLocationPreferencesRoute.path
                                      }
                                      role="admin"
                                      permissions={[
                                        PermissionEnum.SubstituteSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={PeopleSubRelatedOrgsEditLoader}
                                      path={PeopleSubRelatedOrgsEditRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.SubstituteSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={PeopleSubPoolEditLoader}
                                      path={PeopleSubPoolEditRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.SubstituteSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        PeopleReplacementCriteriaEditLoader
                                      }
                                      path={
                                        PeopleReplacementCriteriaEditRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.EmployeeSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        PeopleSubPositionsAttributesEditLoader
                                      }
                                      path={
                                        PeopleSubPositionsAttributesEditRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.SubstituteSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        PeopleEmployeeBalancesEditLoader
                                      }
                                      path={
                                        PeopleEmployeeBalancesEditRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.EmployeeSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        PeopleEmployeePositionEditLoader
                                      }
                                      path={
                                        PeopleEmployeePositionEditRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.EmployeeSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={AdminAddLoader}
                                      path={AdminAddRoute.path}
                                      role={"admin"}
                                      permissions={[PermissionEnum.AdminSave]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        PeopleAdminRelatedOrgsEditLoader
                                      }
                                      path={
                                        PeopleAdminRelatedOrgsEditRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[PermissionEnum.AdminSave]}
                                    />
                                    <ProtectedRoute
                                      component={EmployeeAddLoader}
                                      path={EmployeeAddRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.EmployeeSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={SubstituteAddLoader}
                                      path={SubstituteAddRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.SubstituteSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={PersonViewLoader}
                                      path={PersonViewRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.AdminView,
                                        PermissionEnum.EmployeeView,
                                        PermissionEnum.SubstituteView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={PeopleLoader}
                                      path={PeopleRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.AdminView,
                                        PermissionEnum.EmployeeView,
                                        PermissionEnum.SubstituteView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={SettingsLoader}
                                      path={SettingsRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.GeneralSettingsView,
                                        PermissionEnum.ScheduleSettingsView,
                                        PermissionEnum.AbsVacSettingsView,
                                        PermissionEnum.FinanceSettingsView,
                                        PermissionEnum.ApprovalSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={ReplacementCriteriaEditLoader}
                                      path={ReplacementCriteriaEditRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.FinanceSettingsSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={PositionTypeAddLoader}
                                      path={PositionTypeAddRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.FinanceSettingsSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={PositionTypeEditSettingsLoader}
                                      path={PositionTypeEditSettingsRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.FinanceSettingsSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={PositionTypeViewLoader}
                                      path={PositionTypeViewRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.FinanceSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={PositionTypeLoader}
                                      path={PositionTypeRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.FinanceSettingsView,
                                      ]}
                                    />

                                    <ProtectedRoute
                                      component={BellScheduleAddLoader}
                                      path={BellScheduleAddRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ScheduleSettingsSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={BellScheduleViewLoader}
                                      path={BellScheduleViewRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ScheduleSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={BellScheduleLoader}
                                      path={BellScheduleRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ScheduleSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={VerifyOverviewLoader}
                                      path={VerifyOverviewRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.AbsVacVerify,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={VerifyDailyLoader}
                                      path={VerifyDailyRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.AbsVacVerify,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={BellScheduleVariantsLoader}
                                      path={BellScheduleVariantsRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ScheduleSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={HoursToDaysLoader}
                                      path={HoursToDaysRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ScheduleSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={AdminHomeLoader}
                                      path={AdminHomeRoute.path}
                                      role={"admin"}
                                      exact
                                    />
                                    <ProtectedRoute
                                      component={GeneralSettingsLoader}
                                      path={GeneralSettingsRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.GeneralSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={CalendarChangeReasonLoader}
                                      path={CalendarChangeReasonRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ScheduleSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={ReplacementAttributeLoader}
                                      path={ReplacementAttributeRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.AbsVacSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={VacancyReasonLoader}
                                      path={VacancyReasonRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.AbsVacSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={AbsenceVacancyRulesLoader}
                                      path={AbsenceVacancyRulesRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.AbsVacSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={SubstituteSettingsLoader}
                                      path={SubstituteSettingsRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.AbsVacSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={AccountingCodeLoader}
                                      path={AccountingCodeRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.FinanceSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={PayCodeLoader}
                                      path={PayCodeRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.FinanceSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={AbsenceReasonAddLoader}
                                      path={AbsenceReasonAddRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.AbsVacSettingsSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={AbsenceReasonCategoryAddLoader}
                                      path={AbsenceReasonCategoryAddRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.AbsVacSettingsSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        AbsenceReasonCategoryEditSettingsLoader
                                      }
                                      path={
                                        AbsenceReasonCategoryEditSettingsRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.AbsVacSettingsSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        AbsenceReasonEditSettingsLoader
                                      }
                                      path={AbsenceReasonEditSettingsRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.AbsVacSettingsSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        AbsenceReasonCategoryViewEditLoader
                                      }
                                      path={
                                        AbsenceReasonCategoryViewEditRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.AbsVacSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={AbsenceReasonViewEditLoader}
                                      path={AbsenceReasonViewEditRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.AbsVacSettingsView,
                                      ]}
                                    />

                                    <ProtectedRoute
                                      component={AbsenceReasonLoader}
                                      path={AbsenceReasonRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.AbsVacSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={ContractsLoader}
                                      path={ContractsRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.FinanceSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={LocationSubPrefLoader}
                                      path={LocationSubPrefRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.LocationSaveFavoriteSubs,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={LocationAddLoader}
                                      path={LocationAddRoute.path}
                                      role={"admin"}
                                      permissions={[PermissionEnum.LocationAdd]}
                                    />
                                    <ProtectedRoute
                                      component={LocationEditSettingsLoader}
                                      path={LocationEditSettingsRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.LocationSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={LocationViewLoader}
                                      path={LocationViewRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.LocationView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={LocationsLoader}
                                      path={LocationsRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.LocationView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={LocationGroupAddLoader}
                                      path={LocationGroupAddRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.LocationGroupSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={LocationGroupSubPrefLoader}
                                      path={LocationGroupSubPrefRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.LocationGroupSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={LocationGroupViewLoader}
                                      path={LocationGroupViewRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.LocationGroupView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={LocationGroupsLoader}
                                      path={LocationGroupsRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.LocationGroupView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        ApproverGroupAddRemoveMembersLoader
                                      }
                                      path={
                                        ApproverGroupAddRemoveMembersRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ApprovalSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        ApproverGroupAddLocationsLoader
                                      }
                                      path={ApproverGroupAddLocationsRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ApprovalSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={ApproverGroupAddLoader}
                                      path={ApproverGroupAddRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ApprovalSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={ApproverGroupsLoader}
                                      path={ApproverGroupsRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ApprovalSettingsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      path={CalendarListViewRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.CalendarChangeView,
                                      ]}
                                    >
                                      <CalendarsLoader view="list" />
                                    </ProtectedRoute>

                                    <ProtectedRoute
                                      path={CalendarCalendarViewRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.CalendarChangeView,
                                      ]}
                                    >
                                      <CalendarsLoader view="calendar" />
                                    </ProtectedRoute>

                                    <ProtectedRoute
                                      component={CalendarsLoader}
                                      path={CalendarRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.CalendarChangeView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        SecurityPermissionSetsAddLoader
                                      }
                                      path={SecurityPermissionSetsAddRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.PermissionSetSave,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        SecurityPermissionSetsViewLoader
                                      }
                                      path={
                                        SecurityPermissionSetsViewRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.PermissionSetView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={SecurityPermissionSetsLoader}
                                      path={SecurityPermissionSetsRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.PermissionSetView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={SecurityPartnersLoader}
                                      path={SecurityPartnersRoute.path}
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ExternalConnectionsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        SecurityManagedOrganizationsLoader
                                      }
                                      path={
                                        SecurityManagedOrganizationsRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ExternalConnectionsView,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      path={AdminMobileSearchRoute.path}
                                      component={AdminMobileSearchLoader}
                                      role={"admin"}
                                      permissions={[PermissionEnum.AbsVacView]}
                                    />
                                    <ProtectedRoute
                                      component={DailyReportLoader}
                                      path={DailyReportRoute.path}
                                      role={"admin"}
                                    />
                                    <ProtectedRoute
                                      component={
                                        AnalyticsReportsDailyReportLoader
                                      }
                                      path={
                                        AnalyticsReportsDailyReportRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[PermissionEnum.AbsVacView]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        AnalyticsReportsAbsencesVacanciesLoader
                                      }
                                      path={
                                        AnalyticsReportsAbsencesVacanciesRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ReportsAbsVacSchema,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        AnalyticsReportsAbsencesVacanciesDetailLoader
                                      }
                                      path={
                                        AnalyticsReportsAbsencesVacanciesDetailRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ReportsAbsVacSchema,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        AnalyticsReportsSubHistoryLoader
                                      }
                                      path={
                                        AnalyticsReportsSubHistoryRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ReportsAbsVacSchema,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        AnalyticsReportsEmployeeRosterLoader
                                      }
                                      path={
                                        AnalyticsReportsEmployeeRosterRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ReportsEmpSchema,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        AnalyticsReportsSubstituteRosterLoader
                                      }
                                      path={
                                        AnalyticsReportsSubstituteRosterRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ReportsSubSchema,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={
                                        AnalyticsReportsEmployeeBalancesLoader
                                      }
                                      path={
                                        AnalyticsReportsEmployeeBalancesRoute.path
                                      }
                                      role={"admin"}
                                      permissions={[
                                        PermissionEnum.ReportsEmpSchema,
                                      ]}
                                    />
                                    <ProtectedRoute
                                      component={AnalyticsReportsLoader}
                                      path={AnalyticsReportsRoute.path}
                                      role={"admin"}
                                    />
                                    <ProtectedRoute
                                      component={FeedbackLoader}
                                      path={AdminFeedbackRoute.path}
                                      role={"admin"}
                                    />
                                    {/* This must be the last route in the list as it will handle paths that aren't found*/}
                                    <Route
                                      path={AdminChromeRoute.path}
                                      component={NotFoundLoader}
                                    />
                                  </Switch>
                                </AdminRouteOrganizationContextProvider>
                              </Route>

                              {/* This route handles unknown or underspecified routes and takes the
                              admin to their organization (or a switcher) */}
                              <Route exact path={AdminRootChromeRoute.path}>
                                <Redirect
                                  to={AdminRootChromeRoute.generate({})}
                                />
                              </Route>
                              <Route
                                component={NotFoundLoader}
                                path={AdminRootChromeRoute.path}
                              />
                            </Switch>
                          </IfHasRole>
                          <IfHasRole role={OrgUserRole.Administrator} not>
                            <Redirect to={UnauthorizedRoute.generate({})} />
                          </IfHasRole>
                        </Route>
                        {/* This is a catch all for not found routes when authenticated */}
                        <Route path={"/"}>
                          <Redirect to={NotFoundRoute.generate({})} />
                        </Route>
                      </Switch>
                    </AppChrome>
                  </IfAuthenticated>
                  <IfAuthenticated not>
                    <RedirectToLogin />
                  </IfAuthenticated>
                </RoleContextProvider>
              </Route>
            </Switch>
          </div>
        </div>
      </AppConfigProvider>
    </ThemeProvider>
  );
});

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    "@media print": {
      height: "auto",
    },
  },
  main: {
    flex: "1 0 auto",
  },
});

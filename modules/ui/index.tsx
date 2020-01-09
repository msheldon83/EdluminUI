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
import { VerifyLoader, VerifyRoute } from "./routes/absence-vacancy/verify";
import {
  AbsenceReasonLoader,
  AbsenceReasonRoute,
  AbsenceReasonAddRoute,
  AbsenceReasonAddLoader,
  AbsenceReasonViewEditRoute,
  AbsenceReasonViewEditLoader,
} from "./routes/absence-reason";
import {
  AccountingCodeLoader,
  AccountingCodeRoute,
} from "./routes/accounting-code";
import { AdminHomeLoader, AdminHomeRoute } from "./routes/admin-home";
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
  AdminCreateAbsenceRoute,
  AdminSelectEmployeeForCreateAbsenceRoute,
  CreateAbsenceLoader,
  EmployeeCreateAbsenceLoader,
  EmployeeCreateAbsenceRoute,
  SelectEmployeeForCreateAbsenceLoader,
  CreateAbsenceConfirmationLoader,
  CreateAbsenceConfirmationRoute,
} from "./routes/create-absence";
import {
  AdminEditAbsenceLoader,
  AdminEditAbsenceRoute,
  EmployeeEditAbsenceRoute,
} from "./routes/edit-absence";
import { EmployeeHomeLoader, EmployeeHomeRoute } from "./routes/employee-home";
import {
  GeneralSettingsLoader,
  GeneralSettingsRoute,
} from "./routes/general-settings";
import { ConfigurationLoader, ConfigurationRoute } from "./routes/org-config";
import {
  OrganizationsLoader,
  OrganizationsRoute,
} from "./routes/organizations";
import { PayCodeLoader, PayCodeRoute } from "./routes/pay-code";
import {
  PeopleLoader,
  PeopleRoute,
  PersonViewLoader,
  PeopleSubPoolEditLoader,
  PeopleSubPoolEditRoute,
  PersonViewRoute,
  EmployeeAbsScheduleLoader,
  EmployeeAbsScheduleRoute,
  EmployeeAbsScheduleCalendarViewRoute,
  EmployeeAbsScheduleListViewRoute,
  SubstituteAssignmentScheduleLoader,
  SubstituteAssignmentScheduleRoute,
  SubstituteAssignmentScheduleCalendarViewRoute,
  SubstituteAssignmentScheduleListViewRoute,
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
} from "./routes/position-type";
import { ProfileLoader, ProfileRoute } from "./routes/profile";
import {
  ReplacementAttributeLoader,
  ReplacementAttributeRoute,
} from "./routes/replacement-attribute";
import { SchoolGroupsLoader, SchoolGroupsRoute } from "./routes/school-groups";
import { SchoolsLoader, SchoolsRoute } from "./routes/schools";
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
} from "./routes/security/permission-sets";
import {
  SecurityUsersLoader,
  SecurityUsersRoute,
} from "./routes/security/users";
import { SubHomeLoader, SubHomeRoute } from "./routes/sub-home";
import {
  SubPreferencesLoader,
  SubPreferencesRoute,
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
  EmployeePtoBalanceRoute,
  EmployeePtoBalanceLoader,
} from "./routes/employee-pto-balances";
import { SubSignInRoute, SubSignInLoader } from "ui/routes/sub-sign-in";
import { OrgUserRole } from "graphql/server-types.gen";
import { IfHasRole } from "./components/auth/if-has-role";
import { AdminOrgRoute } from "./components/routing/admin-org-route";

/** Build the core app store with middlewares and reducer. Used to bootstrap the app to run and to test. */

export function App() {
  const classes = useStyles();

  return (
    <ThemeProvider theme={EdluminTheme}>
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
            <Route path={SubSignInRoute.path}>
              <IfAuthenticated>
                <IfHasRole role={OrgUserRole.Administrator}>
                  <Route
                    component={SubSignInLoader}
                    path={SubSignInRoute.path}
                  />
                </IfHasRole>
              </IfAuthenticated>
              <IfAuthenticated not>
                <RedirectToLogin />
              </IfAuthenticated>
            </Route>
            <Route path={AppChromeRoute.path}>
              <IfAuthenticated>
                <AppChrome>
                  <Switch>
                    {/* Protected routes go here */}

                    <Route component={ProfileLoader} path={ProfileRoute.path} />

                    {/* Employee routes go here */}
                    <Route path={EmployeeChromeRoute.path}>
                      <IfHasRole role={OrgUserRole.Employee}>
                        <Switch>
                          <Route
                            component={EmployeeCreateAbsenceLoader}
                            path={EmployeeCreateAbsenceRoute.path}
                          />
                          <Route
                            component={CreateAbsenceConfirmationLoader}
                            path={CreateAbsenceConfirmationRoute.path}
                          />
                          <Route path={EmployeeEditAbsenceRoute.path}>
                            <AdminEditAbsenceLoader actingAsEmployee />
                          </Route>
                          <Route
                            component={EmployeePtoBalanceLoader}
                            path={EmployeePtoBalanceRoute.path}
                          />
                          <Route path={EmployeeScheduleCalendarViewRoute.path}>
                            <EmployeeScheduleLoader view="calendar" />
                          </Route>
                          <Route path={EmployeeScheduleListViewRoute.path}>
                            <EmployeeScheduleLoader view="list" />
                          </Route>
                          <Route path={EmployeeScheduleRoute.path}>
                            <EmployeeScheduleLoader view="list" />
                          </Route>
                          <Route
                            component={EmployeeHomeLoader}
                            path={EmployeeHomeRoute.path}
                          />
                        </Switch>
                      </IfHasRole>
                      <IfHasRole role={OrgUserRole.Employee} not>
                        {/* TODO: Redirect to a page (without navigation or top bar) that generically says you do not have access */}
                        <div>No Access to Employee pages</div>
                      </IfHasRole>
                    </Route>

                    {/* Sub routes go here */}
                    <Route path={SubstituteChromeRoute.path}>
                      <IfHasRole role={OrgUserRole.ReplacementEmployee}>
                        <Switch>
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
                            component={SubHomeLoader}
                            path={SubHomeRoute.path}
                          />
                        </Switch>
                      </IfHasRole>
                      <IfHasRole role={OrgUserRole.ReplacementEmployee} not>
                        {/* TODO: Redirect to a page (without navigation or top bar) that generically says you do not have access */}
                        <div>No Access to Substitute pages</div>
                      </IfHasRole>
                    </Route>

                    <Route path={AdminRootChromeRoute.path}>
                      <IfHasRole role={OrgUserRole.Administrator}>
                        {/* Admin routes go here*/}
                        <Switch>
                          {/*We will need to figure out how to prevent non admin users from accessing this route */}
                          <Route exact path={AdminRootChromeRoute.path}>
                            <OrganizationsLoader redirectIfOneOrg />
                          </Route>
                          <Route
                            component={OrganizationsLoader}
                            path={OrganizationsRoute.path}
                          />
                          <Route path={AdminChromeRoute.path}>
                            <Switch>
                              <AdminOrgRoute
                                component={AdminEditAbsenceLoader}
                                path={AdminEditAbsenceRoute.path}
                              />
                              <AdminOrgRoute
                                component={CreateAbsenceLoader}
                                path={AdminCreateAbsenceRoute.path}
                              />
                              <AdminOrgRoute
                                component={SelectEmployeeForCreateAbsenceLoader}
                                path={
                                  AdminSelectEmployeeForCreateAbsenceRoute.path
                                }
                              />
                              <AdminOrgRoute
                                path={EmployeeAbsScheduleCalendarViewRoute.path}
                              >
                                <EmployeeAbsScheduleLoader view="calendar" />
                              </AdminOrgRoute>

                              <AdminOrgRoute
                                path={EmployeeAbsScheduleListViewRoute.path}
                              >
                                <EmployeeAbsScheduleLoader view="list" />
                              </AdminOrgRoute>
                              <AdminOrgRoute
                                component={EmployeeAbsScheduleLoader}
                                path={EmployeeAbsScheduleRoute.path}
                              />

                              <AdminOrgRoute
                                path={
                                  SubstituteAssignmentScheduleCalendarViewRoute.path
                                }
                              >
                                <SubstituteAssignmentScheduleLoader view="calendar" />
                              </AdminOrgRoute>

                              <AdminOrgRoute
                                path={
                                  SubstituteAssignmentScheduleListViewRoute.path
                                }
                              >
                                <SubstituteAssignmentScheduleLoader view="list" />
                              </AdminOrgRoute>
                              <AdminOrgRoute
                                component={SubstituteAssignmentScheduleLoader}
                                path={SubstituteAssignmentScheduleRoute.path}
                              />
                              <AdminOrgRoute
                                component={PeopleSubPoolEditLoader}
                                path={PeopleSubPoolEditRoute.path}
                              />
                              <AdminOrgRoute
                                component={PersonViewLoader}
                                path={PersonViewRoute.path}
                              />
                              <AdminOrgRoute
                                component={PeopleLoader}
                                path={PeopleRoute.path}
                              />
                              <AdminOrgRoute
                                component={ConfigurationLoader}
                                path={ConfigurationRoute.path}
                              />
                              <AdminOrgRoute
                                component={PositionTypeAddLoader}
                                path={PositionTypeAddRoute.path}
                              />
                              <AdminOrgRoute
                                component={PositionTypeEditSettingsLoader}
                                path={PositionTypeEditSettingsRoute.path}
                              />
                              <AdminOrgRoute
                                component={PositionTypeViewLoader}
                                path={PositionTypeViewRoute.path}
                              />
                              <AdminOrgRoute
                                component={PositionTypeLoader}
                                path={PositionTypeRoute.path}
                              />
                              <AdminOrgRoute
                                component={BellScheduleAddLoader}
                                path={BellScheduleAddRoute.path}
                              />
                              <AdminOrgRoute
                                component={BellScheduleViewLoader}
                                path={BellScheduleViewRoute.path}
                              />
                              <AdminOrgRoute
                                component={BellScheduleLoader}
                                path={BellScheduleRoute.path}
                              />
                              <AdminOrgRoute
                                component={VerifyLoader}
                                path={VerifyRoute.path}
                              />
                              <AdminOrgRoute
                                component={BellScheduleVariantsLoader}
                                path={BellScheduleVariantsRoute.path}
                              />
                              <AdminOrgRoute
                                component={AdminHomeLoader}
                                path={AdminHomeRoute.path}
                                exact
                              />
                              <AdminOrgRoute
                                component={GeneralSettingsLoader}
                                path={GeneralSettingsRoute.path}
                              />
                              <AdminOrgRoute
                                component={CalendarChangeReasonLoader}
                                path={CalendarChangeReasonRoute.path}
                              />
                              <AdminOrgRoute
                                component={ReplacementAttributeLoader}
                                path={ReplacementAttributeRoute.path}
                              />
                              <AdminOrgRoute
                                component={AbsenceReasonLoader}
                                path={AbsenceReasonRoute.path}
                              />
                              <AdminOrgRoute
                                component={VacancyReasonLoader}
                                path={VacancyReasonRoute.path}
                              />
                              <AdminOrgRoute
                                component={AbsenceVacancyRulesLoader}
                                path={AbsenceVacancyRulesRoute.path}
                              />
                              <AdminOrgRoute
                                component={SubstituteSettingsLoader}
                                path={SubstituteSettingsRoute.path}
                              />
                              <AdminOrgRoute
                                component={AccountingCodeLoader}
                                path={AccountingCodeRoute.path}
                              />

                              <AdminOrgRoute
                                component={PayCodeLoader}
                                path={PayCodeRoute.path}
                              />
                              <AdminOrgRoute
                                component={AbsenceReasonAddLoader}
                                path={AbsenceReasonAddRoute.path}
                              />
                              <AdminOrgRoute
                                component={AbsenceReasonViewEditLoader}
                                path={AbsenceReasonViewEditRoute.path}
                              />
                              <AdminOrgRoute
                                component={AbsenceReasonLoader}
                                path={AbsenceReasonRoute.path}
                              />
                              <AdminOrgRoute
                                component={ContractsLoader}
                                path={ContractsRoute.path}
                              />
                              <AdminOrgRoute
                                component={SchoolsLoader}
                                path={SchoolsRoute.path}
                              />
                              <AdminOrgRoute
                                component={SchoolGroupsLoader}
                                path={SchoolGroupsRoute.path}
                              />
                              <AdminOrgRoute path={CalendarListViewRoute.path}>
                                <CalendarsLoader view="list" />
                              </AdminOrgRoute>

                              <AdminOrgRoute
                                path={CalendarCalendarViewRoute.path}
                              >
                                <CalendarsLoader view="calendar" />
                              </AdminOrgRoute>

                              <AdminOrgRoute
                                component={CalendarsLoader}
                                path={CalendarRoute.path}
                              />
                              <AdminOrgRoute
                                component={SecurityUsersLoader}
                                path={SecurityUsersRoute.path}
                              />
                              <AdminOrgRoute
                                component={SecurityPermissionSetsLoader}
                                path={SecurityPermissionSetsRoute.path}
                              />
                              <AdminOrgRoute
                                component={SecurityPartnersLoader}
                                path={SecurityPartnersRoute.path}
                              />
                              <AdminOrgRoute
                                component={SecurityManagedOrganizationsLoader}
                                path={SecurityManagedOrganizationsRoute.path}
                              />
                              <AdminOrgRoute
                                component={DailyReportLoader}
                                path={DailyReportRoute.path}
                              />
                            </Switch>
                          </Route>

                          {/* This route handles unknown or underspecified routes and takes the
                              admin to their organization (or a switcher) */}
                          <Route path={AdminRootChromeRoute.path}>
                            <Redirect to={AdminRootChromeRoute.generate({})} />
                          </Route>
                        </Switch>
                      </IfHasRole>
                      <IfHasRole role={OrgUserRole.Administrator} not>
                        {/* TODO: Redirect to a page (without navigation or top bar) that generically says you do not have access */}
                        <div>No Access to Admin pages</div>
                      </IfHasRole>
                    </Route>
                  </Switch>
                </AppChrome>
              </IfAuthenticated>
              <IfAuthenticated not>
                <RedirectToLogin />
              </IfAuthenticated>
            </Route>
          </Switch>
        </div>
      </div>
    </ThemeProvider>
  );
}

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

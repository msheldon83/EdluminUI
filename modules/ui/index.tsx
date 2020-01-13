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
import { OrgSettingsLoader, OrgSettingsRoute } from "./routes/org-settings";
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
import {
  LocationGroupsLoader,
  LocationGroupsRoute,
} from "./routes/location-groups";
import { LocationsLoader, LocationsRoute } from "./routes/locations";
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
            <Route
              exact
              component={UnauthorizedLoader}
              path={UnauthorizedRoute.path}
            />
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
                            component={UnauthorizedLoader}
                            path={UnauthorizedEmployeeRoleRoute.path}
                          />
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
                          <ProtectedRoute
                            component={EmployeePtoBalanceLoader}
                            path={EmployeePtoBalanceRoute.path}
                            role={"employee"}
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
                        <Redirect to={UnauthorizedRoute.generate({})} />
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
                              <Route
                                component={UnauthorizedLoader}
                                path={UnauthorizedAdminRoleRoute.path}
                              />
                              <ProtectedRoute
                                component={AdminEditAbsenceLoader}
                                path={AdminEditAbsenceRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={CreateAbsenceLoader}
                                path={AdminCreateAbsenceRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={SelectEmployeeForCreateAbsenceLoader}
                                path={
                                  AdminSelectEmployeeForCreateAbsenceRoute.path
                                }
                                role={"admin"}
                              />
                              <ProtectedRoute
                                path={EmployeeAbsScheduleCalendarViewRoute.path}
                                role={"admin"}
                              >
                                <EmployeeAbsScheduleLoader view="calendar" />
                              </ProtectedRoute>

                              <ProtectedRoute
                                path={EmployeeAbsScheduleListViewRoute.path}
                                role={"admin"}
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
                              >
                                <SubstituteAssignmentScheduleLoader view="calendar" />
                              </ProtectedRoute>

                              <ProtectedRoute
                                path={
                                  SubstituteAssignmentScheduleListViewRoute.path
                                }
                                role={"admin"}
                              >
                                <SubstituteAssignmentScheduleLoader view="list" />
                              </ProtectedRoute>
                              <ProtectedRoute
                                component={SubstituteAssignmentScheduleLoader}
                                path={SubstituteAssignmentScheduleRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={PeopleSubPoolEditLoader}
                                path={PeopleSubPoolEditRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={PersonViewLoader}
                                path={PersonViewRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={PeopleLoader}
                                path={PeopleRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={OrgSettingsLoader}
                                path={OrgSettingsRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={PositionTypeAddLoader}
                                path={PositionTypeAddRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={PositionTypeEditSettingsLoader}
                                path={PositionTypeEditSettingsRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={PositionTypeViewLoader}
                                path={PositionTypeViewRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={PositionTypeLoader}
                                path={PositionTypeRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={BellScheduleAddLoader}
                                path={BellScheduleAddRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={BellScheduleViewLoader}
                                path={BellScheduleViewRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={BellScheduleLoader}
                                path={BellScheduleRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={VerifyLoader}
                                path={VerifyRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={BellScheduleVariantsLoader}
                                path={BellScheduleVariantsRoute.path}
                                role={"admin"}
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
                              />
                              <ProtectedRoute
                                component={CalendarChangeReasonLoader}
                                path={CalendarChangeReasonRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={ReplacementAttributeLoader}
                                path={ReplacementAttributeRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={AbsenceReasonLoader}
                                path={AbsenceReasonRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={VacancyReasonLoader}
                                path={VacancyReasonRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={AbsenceVacancyRulesLoader}
                                path={AbsenceVacancyRulesRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={SubstituteSettingsLoader}
                                path={SubstituteSettingsRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={AccountingCodeLoader}
                                path={AccountingCodeRoute.path}
                                role={"admin"}
                              />

                              <ProtectedRoute
                                component={PayCodeLoader}
                                path={PayCodeRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={AbsenceReasonAddLoader}
                                path={AbsenceReasonAddRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={AbsenceReasonViewEditLoader}
                                path={AbsenceReasonViewEditRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={AbsenceReasonLoader}
                                path={AbsenceReasonRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={ContractsLoader}
                                path={ContractsRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={LocationsLoader}
                                path={LocationsRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={LocationGroupsLoader}
                                path={LocationGroupsRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                path={CalendarListViewRoute.path}
                                role={"admin"}
                              >
                                <CalendarsLoader view="list" />
                              </ProtectedRoute>

                              <ProtectedRoute
                                path={CalendarCalendarViewRoute.path}
                                role={"admin"}
                              >
                                <CalendarsLoader view="calendar" />
                              </ProtectedRoute>

                              <ProtectedRoute
                                component={CalendarsLoader}
                                path={CalendarRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={SecurityUsersLoader}
                                path={SecurityUsersRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={SecurityPermissionSetsAddLoader}
                                path={SecurityPermissionSetsAddRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={SecurityPermissionSetsViewLoader}
                                path={SecurityPermissionSetsViewRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={SecurityPermissionSetsLoader}
                                path={SecurityPermissionSetsRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={SecurityPartnersLoader}
                                path={SecurityPartnersRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={SecurityManagedOrganizationsLoader}
                                path={SecurityManagedOrganizationsRoute.path}
                                role={"admin"}
                              />
                              <ProtectedRoute
                                component={DailyReportLoader}
                                path={DailyReportRoute.path}
                                role={"admin"}
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
                        <Redirect to={UnauthorizedRoute.generate({})} />
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

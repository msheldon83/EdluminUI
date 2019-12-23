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
import { AdminRootChromeRoute, AppChromeRoute } from "./routes/app-chrome";
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
  CalendarPastYearsLoader,
  CalendarPastYearsRoute,
} from "./routes/calendar/past-years";
import {
  CalendarThisYearLoader,
  CalendarThisYearRoute,
} from "./routes/calendar/this-year";
import { ContractsLoader, ContractsRoute } from "./routes/contracts";
import {
  AdminCreateAbsenceRoute,
  AdminSelectEmployeeForCreateAbsenceRoute,
  CreateAbsenceLoader,
  EmployeeCreateAbsenceLoader,
  EmployeeCreateAbsenceRoute,
  SelectEmployeeForCreateAbsenceLoader,
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
  PersonViewRoute,
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
            <Route path={AppChromeRoute.path}>
              <IfAuthenticated>
                <AppChrome>
                  <Switch>
                    {/* Protected routes go here */}

                    <Route component={ProfileLoader} path={ProfileRoute.path} />
                    <Route
                      component={EmployeeCreateAbsenceLoader}
                      path={EmployeeCreateAbsenceRoute.path}
                    />
                    <Route path={EmployeeEditAbsenceRoute.path}>
                      <AdminEditAbsenceLoader actingAsEmployee />
                    </Route>

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
                    <Route component={SubHomeLoader} path={SubHomeRoute.path} />

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

                    <Route path={AdminRootChromeRoute.path}>
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
                        <Route
                          component={AdminEditAbsenceLoader}
                          path={AdminEditAbsenceRoute.path}
                        />
                        <Route
                          component={CreateAbsenceLoader}
                          path={AdminCreateAbsenceRoute.path}
                        />
                        <Route
                          component={SelectEmployeeForCreateAbsenceLoader}
                          path={AdminSelectEmployeeForCreateAbsenceRoute.path}
                        />
                        <Route
                          component={PersonViewLoader}
                          path={PersonViewRoute.path}
                        />
                        <Route
                          component={PeopleLoader}
                          path={PeopleRoute.path}
                        />
                        <Route
                          component={ConfigurationLoader}
                          path={ConfigurationRoute.path}
                        />
                        <Route
                          component={PositionTypeAddLoader}
                          path={PositionTypeAddRoute.path}
                        />
                        <Route
                          component={PositionTypeEditSettingsLoader}
                          path={PositionTypeEditSettingsRoute.path}
                        />
                        <Route
                          component={PositionTypeViewLoader}
                          path={PositionTypeViewRoute.path}
                        />
                        <Route
                          component={PositionTypeLoader}
                          path={PositionTypeRoute.path}
                        />
                        <Route
                          component={BellScheduleAddLoader}
                          path={BellScheduleAddRoute.path}
                        />
                        <Route
                          component={BellScheduleViewLoader}
                          path={BellScheduleViewRoute.path}
                        />
                        <Route
                          component={BellScheduleLoader}
                          path={BellScheduleRoute.path}
                        />
                        <Route
                          component={VerifyLoader}
                          path={VerifyRoute.path}
                        />
                        <Route
                          component={BellScheduleVariantsLoader}
                          path={BellScheduleVariantsRoute.path}
                        />
                        <Route
                          component={AdminHomeLoader}
                          path={AdminHomeRoute.path}
                          exact
                        />
                        <Route
                          component={GeneralSettingsLoader}
                          path={GeneralSettingsRoute.path}
                        />
                        <Route
                          component={CalendarChangeReasonLoader}
                          path={CalendarChangeReasonRoute.path}
                        />
                        <Route
                          component={ReplacementAttributeLoader}
                          path={ReplacementAttributeRoute.path}
                        />
                        <Route
                          component={AbsenceReasonLoader}
                          path={AbsenceReasonRoute.path}
                        />
                        <Route
                          component={VacancyReasonLoader}
                          path={VacancyReasonRoute.path}
                        />
                        <Route
                          component={AbsenceVacancyRulesLoader}
                          path={AbsenceVacancyRulesRoute.path}
                        />
                        <Route
                          component={SubstituteSettingsLoader}
                          path={SubstituteSettingsRoute.path}
                        />
                        <Route
                          component={AccountingCodeLoader}
                          path={AccountingCodeRoute.path}
                        />

                        <Route
                          component={PayCodeLoader}
                          path={PayCodeRoute.path}
                        />
                        <Route
                          component={AbsenceReasonAddLoader}
                          path={AbsenceReasonAddRoute.path}
                        />
                        <Route
                          component={AbsenceReasonViewEditLoader}
                          path={AbsenceReasonViewEditRoute.path}
                        />
                        <Route
                          component={AbsenceReasonLoader}
                          path={AbsenceReasonRoute.path}
                        />
                        <Route
                          component={ContractsLoader}
                          path={ContractsRoute.path}
                        />
                        <Route
                          component={SchoolsLoader}
                          path={SchoolsRoute.path}
                        />
                        <Route
                          component={SchoolGroupsLoader}
                          path={SchoolGroupsRoute.path}
                        />
                        <Route
                          component={CalendarThisYearLoader}
                          path={CalendarThisYearRoute.path}
                        />
                        <Route
                          component={CalendarPastYearsLoader}
                          path={CalendarPastYearsRoute.path}
                        />
                        <Route
                          component={SecurityUsersLoader}
                          path={SecurityUsersRoute.path}
                        />
                        <Route
                          component={SecurityPermissionSetsLoader}
                          path={SecurityPermissionSetsRoute.path}
                        />
                        <Route
                          component={SecurityPartnersLoader}
                          path={SecurityPartnersRoute.path}
                        />
                        <Route
                          component={SecurityManagedOrganizationsLoader}
                          path={SecurityManagedOrganizationsRoute.path}
                        />

                        <Route
                          component={DailyReportLoader}
                          path={DailyReportRoute.path}
                        />
                        {/* This route handles unknown or underspecified routes and takes the
                              admin to their organization (or a switcher) */}
                        <Route path={AdminRootChromeRoute.path}>
                          <Redirect to={AdminRootChromeRoute.generate({})} />
                        </Route>
                      </Switch>
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

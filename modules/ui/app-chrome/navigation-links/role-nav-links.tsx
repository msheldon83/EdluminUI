import * as React from "react";
import { Route, Switch } from "react-router";
import { AdminHomeRoute } from "ui/routes/admin-home";
import {
  AdminChromeRoute,
  AdminRootChromeRoute,
  AppChromeRoute,
} from "ui/routes/app-chrome";
import { defineSubRoute, useRouteParams } from "ui/routes/definition";
import { EmployeeHomeRoute } from "ui/routes/employee-home";
import { EmployeePtoBalanceRoute } from "ui/routes/employee-pto-balances";
import { OrganizationsRoute } from "ui/routes/organizations";
import { PeopleRoute } from "ui/routes/people";
import { CalendarListViewRoute } from "ui/routes/calendar/calendar";
import { SubHomeRoute } from "ui/routes/sub-home";
import { SubPreferencesRoute } from "ui/routes/sub-preferences";
import { SubScheduleRoute } from "ui/routes/sub-schedule";
import { useIsSystemAdminOrAdminInMultipleOrgs } from "../hooks";
import {
  AbsenceNavLink,
  AnalyticsAndReportsNavLink,
  CalendarNavLink,
  SettingsNavLink,
  HomeNavLink,
  MyScheduleNavLink,
  OrganizationsNavLink,
  PeopleNavLink,
  PTOBalancesNavLink,
  SchoolsNavLink,
  SecurityNavLink,
  SubPreferencesNavLink,
} from "./custom-nav-links";
import { OrgSettingsRoute } from "ui/routes/org-settings";
import { AdminSelectEmployeeForCreateAbsenceRoute } from "ui/routes/create-absence";
import { LocationsRoute } from "ui/routes/locations";
import { EmployeeScheduleRoute } from "ui/routes/employee-schedule";

type Props = {
  navBarExpanded: boolean;
  onClick?: () => void;
};

const tbd = defineSubRoute(AppChromeRoute, "tbd");
const adminTbd = defineSubRoute(AdminChromeRoute, "tbd");

export const AutoSwitchingNavLinks: React.FC<Props> = props => {
  return (
    <Switch>
      <Route path={AppChromeRoute.generate({ role: "employee" })}>
        <EmployeeNavLinks {...props} />
      </Route>
      <Route path={AppChromeRoute.generate({ role: "substitute" })}>
        <SubstituteNavLinks {...props} />
      </Route>
      <Route path={AdminChromeRoute.path}>
        <AdminNavLinks {...props} />
      </Route>
      <Route path={AdminRootChromeRoute.path}>
        <AdminNavLinks {...props} />
      </Route>
    </Switch>
  );
};

export const EmployeeNavLinks: React.FC<Props> = props => {
  const params = { role: "employee" };
  return (
    <>
      <HomeNavLink
        onClick={props.onClick}
        navBarExpanded={props.navBarExpanded}
        route={EmployeeHomeRoute.generate(params)}
      />
      <MyScheduleNavLink
        onClick={props.onClick}
        navBarExpanded={props.navBarExpanded}
        route={EmployeeScheduleRoute.generate(params)}
      />
      <PTOBalancesNavLink
        onClick={props.onClick}
        navBarExpanded={props.navBarExpanded}
        route={EmployeePtoBalanceRoute.generate(params)}
      />
      <SubPreferencesNavLink
        onClick={props.onClick}
        navBarExpanded={props.navBarExpanded}
        route={tbd.generate(params)}
      />
    </>
  );
};

export const SubstituteNavLinks: React.FC<Props> = props => {
  const params = { role: "substitute" };
  return (
    <>
      <HomeNavLink
        onClick={props.onClick}
        navBarExpanded={props.navBarExpanded}
        route={SubHomeRoute.generate(params)}
      />
      <MyScheduleNavLink
        onClick={props.onClick}
        navBarExpanded={props.navBarExpanded}
        route={SubScheduleRoute.generate(params)}
      />
      <SubPreferencesNavLink
        onClick={props.onClick}
        navBarExpanded={props.navBarExpanded}
        route={SubPreferencesRoute.generate(params)}
      />
    </>
  );
};

export const AdminNavLinks: React.FC<Props> = props => {
  const params = useRouteParams(AdminChromeRoute);
  const showOrgs = useIsSystemAdminOrAdminInMultipleOrgs();
  const inOrg = !isNaN(+params.organizationId);
  return (
    <>
      {inOrg && (
        <>
          <HomeNavLink
            onClick={props.onClick}
            navBarExpanded={props.navBarExpanded}
            route={AdminHomeRoute.generate(params)}
          />
          {/* TODO: For now we'll go directly to Absence Create */}
          <AbsenceNavLink
            onClick={props.onClick}
            navBarExpanded={props.navBarExpanded}
            route={AdminSelectEmployeeForCreateAbsenceRoute.generate(params)}
            orgId={params.organizationId}
          />
          <AnalyticsAndReportsNavLink
            onClick={props.onClick}
            navBarExpanded={props.navBarExpanded}
            route={adminTbd.generate(params)}
            orgId={params.organizationId}
          />
          <SchoolsNavLink
            onClick={props.onClick}
            navBarExpanded={props.navBarExpanded}
            route={LocationsRoute.generate(params)}
            orgId={params.organizationId}
          />
          <PeopleNavLink
            onClick={props.onClick}
            navBarExpanded={props.navBarExpanded}
            route={PeopleRoute.generate(params)}
            orgId={params.organizationId}
          />
          <CalendarNavLink
            onClick={props.onClick}
            navBarExpanded={props.navBarExpanded}
            route={CalendarListViewRoute.generate(params)}
            orgId={params.organizationId}
          />
          <SettingsNavLink
            onClick={props.onClick}
            navBarExpanded={props.navBarExpanded}
            route={OrgSettingsRoute.generate(params)}
            orgId={params.organizationId}
          />
          <SecurityNavLink
            onClick={props.onClick}
            navBarExpanded={props.navBarExpanded}
            route={adminTbd.generate(params)}
            orgId={params.organizationId}
          />
        </>
      )}
      {showOrgs && (
        <OrganizationsNavLink
          onClick={props.onClick}
          navBarExpanded={props.navBarExpanded}
          route={
            inOrg
              ? OrganizationsRoute.generate(params)
              : AdminRootChromeRoute.generate({})
          }
        />
      )}
    </>
  );
};

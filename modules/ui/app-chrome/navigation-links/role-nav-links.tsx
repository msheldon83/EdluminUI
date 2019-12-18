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
import { SubHomeRoute } from "ui/routes/sub-home";
import { SubPreferencesRoute } from "ui/routes/sub-preferences";
import { SubScheduleRoute } from "ui/routes/sub-schedule";
import { useIsSystemAdminOrAdminInMultipleOrgs } from "../hooks";
import {
  AbsenceNavLink,
  AnalyticsAndReportsNavLink,
  CalendarNavLink,
  ConfigurationNavLink,
  HomeNavLink,
  MyScheduleNavLink,
  OrganizationsNavLink,
  PeopleNavLink,
  PTOBalancesNavLink,
  SchoolsNavLink,
  SecurityNavLink,
  SubPreferencesNavLink,
} from "./custom-nav-links";
import { ConfigurationRoute } from "ui/routes/org-config";
import { AdminSelectEmployeeForCreateAbsenceRoute } from "ui/routes/create-absence";
import { SchoolsRoute } from "ui/routes/schools";
import { EmployeeScheduleRoute } from "ui/routes/employee-schedule";

type Props = {
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
        route={EmployeeHomeRoute.generate(params)}
      />
      <MyScheduleNavLink
        onClick={props.onClick}
        route={EmployeeScheduleRoute.generate(params)}
      />
      <PTOBalancesNavLink
        onClick={props.onClick}
        route={EmployeePtoBalanceRoute.generate(params)}
      />
      <SubPreferencesNavLink
        onClick={props.onClick}
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
        route={SubHomeRoute.generate(params)}
      />
      <MyScheduleNavLink
        onClick={props.onClick}
        route={SubScheduleRoute.generate(params)}
      />
      <SubPreferencesNavLink
        onClick={props.onClick}
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
            route={AdminHomeRoute.generate(params)}
          />
          {/* TODO: For now we'll go directly to Absence Create */}
          <AbsenceNavLink
            onClick={props.onClick}
            route={AdminSelectEmployeeForCreateAbsenceRoute.generate(params)}
          />
          <AnalyticsAndReportsNavLink
            onClick={props.onClick}
            route={adminTbd.generate(params)}
          />
          <SchoolsNavLink
            onClick={props.onClick}
            route={SchoolsRoute.generate(params)}
          />
          <PeopleNavLink
            onClick={props.onClick}
            route={PeopleRoute.generate(params)}
          />
          <CalendarNavLink
            onClick={props.onClick}
            route={adminTbd.generate(params)}
          />
          <ConfigurationNavLink
            onClick={props.onClick}
            route={ConfigurationRoute.generate(params)}
          />
          <SecurityNavLink
            onClick={props.onClick}
            route={adminTbd.generate(params)}
          />
        </>
      )}
      {showOrgs && (
        <OrganizationsNavLink
          onClick={props.onClick}
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

import * as React from "react";
import {
  HomeNavLink,
  OrganizationsNavLink,
  AbsenceNavLink,
  MyScheduleNavLink,
  PTOBalancesNavLink,
  SubPreferencesNavLink,
  SecurityNavLink,
  AnalyticsAndReportsNavLink,
  SchoolsNavLink,
  CalendarNavLink,
  PeopleNavLink,
  ConfigurationNavLink,
} from "./custom-nav-links";
import { useRouteParams, defineSubRoute } from "ui/routes/definition";
import { AppChromeRoute, AdminChromeRoute } from "ui/routes/app-chrome";
import { OrganizationsRoute, OrganizationsNoOrgRoute } from "ui/routes/organizations";
import { Switch, Route } from "react-router";
import { useIsSystemAdminOrAdminInMultipleOrgs } from "../hooks";
import { PeopleRoute } from "ui/routes/people";

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
    </Switch>
  );
};

export const EmployeeNavLinks: React.FC<Props> = props => {
  const params = { role: "employee" };
  return (
    <>
      <HomeNavLink
        onClick={props.onClick}
        route={AppChromeRoute.generate(params)}
      />
      <MyScheduleNavLink onClick={props.onClick} route={tbd.generate(params)} />
      <PTOBalancesNavLink
        onClick={props.onClick}
        route={tbd.generate(params)}
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
        route={AppChromeRoute.generate(params)}
      />
      <MyScheduleNavLink onClick={props.onClick} route={tbd.generate(params)} />
      <SubPreferencesNavLink
        onClick={props.onClick}
        route={tbd.generate(params)}
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
            route={AdminChromeRoute.generate(params)}
          />
          <AbsenceNavLink
            onClick={props.onClick}
            route={adminTbd.generate(params)}
          />
          <AnalyticsAndReportsNavLink
            onClick={props.onClick}
            route={adminTbd.generate(params)}
          />
          <SchoolsNavLink
            onClick={props.onClick}
            route={adminTbd.generate(params)}
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
            route={adminTbd.generate(params)}
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
          route={inOrg ? OrganizationsRoute.generate(params) : OrganizationsNoOrgRoute.generate({role: "admin"}) }
        />
      )}
    </>
  );
};

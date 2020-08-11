import * as React from "react";
import { Can } from "ui/components/auth/can";
import { Route, Switch } from "react-router";
import { PermissionEnum } from "graphql/server-types.gen";
import { AdminHomeRoute } from "ui/routes/admin-home";
import {
  AdminChromeRoute,
  AdminRootChromeRoute,
  AppChromeRoute,
} from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";
import { EmployeeHomeRoute } from "ui/routes/employee-home";
import { EmployeePtoBalanceRoute } from "ui/routes/employee-pto-balances";
import { EmployeeSubPreferenceRoute } from "ui/routes/employee-sub-preferences";
import { OrganizationsRoute } from "ui/routes/organizations";
import { PeopleRoute } from "ui/routes/people";
import { CalendarCalendarViewRoute } from "ui/routes/calendar/calendar";
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
  EmpSubPreferencesNavLink,
  SubPreferencesNavLink,
  MobileSearchNavLink,
  DataManagementNavLink,
} from "./custom-nav-links";
import { SettingsRoute } from "ui/routes/settings";
import { AdminSelectEmployeeForCreateAbsenceRoute } from "ui/routes/absence";
import { LocationsRoute } from "ui/routes/locations";
import { DataImportRoute } from "ui/routes/data-import";
import { EmployeeScheduleRoute } from "ui/routes/employee-schedule";
import {
  AnalyticsReportsDailyReportRoute,
  AnalyticsReportsRoute,
} from "ui/routes/analytics-reports";
import { DailyReportRoute } from "ui/routes/absence-vacancy/daily-report";
import { useIsMobile } from "hooks";
import {
  AdminMobileSearchRoute,
  SubMobileSearchRoute,
  EmpMobileSearchRoute,
} from "ui/routes/mobile-search";
import { SecurityPermissionSetsRoute } from "ui/routes/security/permission-sets";
import { canViewAsSysAdmin } from "helpers/permissions";

type Props = {
  navBarExpanded: boolean;
  onClick?: () => void;
};

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
  const isMobile = useIsMobile();
  return (
    <>
      {isMobile && (
        <MobileSearchNavLink
          onClick={props.onClick}
          navBarExpanded={props.navBarExpanded}
          route={EmpMobileSearchRoute.generate(params)}
        />
      )}
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
      <EmpSubPreferencesNavLink
        onClick={props.onClick}
        navBarExpanded={props.navBarExpanded}
        route={EmployeeSubPreferenceRoute.generate(params)}
      />
    </>
  );
};

export const SubstituteNavLinks: React.FC<Props> = props => {
  const params = { role: "substitute" };
  const isMobile = useIsMobile();
  return (
    <>
      {isMobile && (
        <MobileSearchNavLink
          onClick={props.onClick}
          navBarExpanded={props.navBarExpanded}
          route={SubMobileSearchRoute.generate(params)}
        />
      )}
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
  const isMobile = useIsMobile();
  const organizationId = params.organizationId;
  return (
    <>
      {inOrg && (
        <>
          {isMobile && (
            <MobileSearchNavLink
              onClick={props.onClick}
              navBarExpanded={props.navBarExpanded}
              route={AdminMobileSearchRoute.generate(params)}
            />
          )}
          <HomeNavLink
            onClick={props.onClick}
            navBarExpanded={props.navBarExpanded}
            route={AdminHomeRoute.generate(params)}
          />
          {/* TODO: For now we'll go directly to Absence Create */}
          <Can not do={[PermissionEnum.AbsVacSave]} orgId={organizationId}>
            <AbsenceNavLink
              onClick={props.onClick}
              navBarExpanded={props.navBarExpanded}
              route={DailyReportRoute.generate(params)}
              orgId={params.organizationId}
            />
          </Can>
          <Can do={[PermissionEnum.AbsVacSave]} orgId={organizationId}>
            <AbsenceNavLink
              onClick={props.onClick}
              navBarExpanded={props.navBarExpanded}
              route={AdminSelectEmployeeForCreateAbsenceRoute.generate(params)}
              orgId={params.organizationId}
            />
          </Can>
          <AnalyticsAndReportsNavLink
            onClick={props.onClick}
            navBarExpanded={props.navBarExpanded}
            route={AnalyticsReportsRoute.generate(params)}
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
            route={CalendarCalendarViewRoute.generate(params)}
            orgId={params.organizationId}
          />
          <SettingsNavLink
            onClick={props.onClick}
            navBarExpanded={props.navBarExpanded}
            route={SettingsRoute.generate(params)}
            orgId={params.organizationId}
          />
          <DataManagementNavLink
            onClick={props.onClick}
            navBarExpanded={props.navBarExpanded}
            route={DataImportRoute.generate(params)}
            orgId={params.organizationId}
          />
          <SecurityNavLink
            onClick={props.onClick}
            navBarExpanded={props.navBarExpanded}
            route={SecurityPermissionSetsRoute.generate(params)}
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

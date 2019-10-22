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
import { useRouteParams } from "ui/routes/definition";
import { AppChromeRoute, AdminChromeRoute } from "ui/routes/app-chrome";
import { OrganizationsRoute } from "ui/routes/organizations";

type Props = {};

export const EmployeeNavLinks: React.FC<{}> = props => {
  const params = useRouteParams(AppChromeRoute);
  return (
    <>
      <HomeNavLink route={AppChromeRoute.generate(params)} />
      <MyScheduleNavLink route={AppChromeRoute.generate(params)} />
      <PTOBalancesNavLink route={AppChromeRoute.generate(params)} />
      <SubPreferencesNavLink route={AppChromeRoute.generate(params)} />
    </>
  );
};

export const SubstituteNavLinks: React.FC<{}> = props => {
  const params = useRouteParams(AppChromeRoute);
  return (
    <>
      <HomeNavLink route={AppChromeRoute.generate(params)} />
      <MyScheduleNavLink route={AppChromeRoute.generate(params)} />
      <SubPreferencesNavLink route={AppChromeRoute.generate(params)} />
    </>
  );
};

export const AdminNavLinks: React.FC<Props> = props => {
  const params = useRouteParams(AdminChromeRoute);
  return (
    <>
      <HomeNavLink route={AdminChromeRoute.generate(params)} />
      <AbsenceNavLink route={AdminChromeRoute.generate(params)} />
      <AnalyticsAndReportsNavLink route={AdminChromeRoute.generate(params)} />
      <SchoolsNavLink route={AdminChromeRoute.generate(params)} />
      <PeopleNavLink route={AdminChromeRoute.generate(params)} />
      <CalendarNavLink route={AdminChromeRoute.generate(params)} />
      <ConfigurationNavLink route={AdminChromeRoute.generate(params)} />
      <SecurityNavLink route={AdminChromeRoute.generate(params)} />
      <OrganizationsNavLink route={OrganizationsRoute.generate(params)} />
    </>
  );
};

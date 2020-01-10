import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import BusinessIcon from "@material-ui/icons/Business";
import DateRangeIcon from "@material-ui/icons/DateRange";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import HomeIcon from "@material-ui/icons/Home";
import LocationCityIcon from "@material-ui/icons/LocationCity";
import LockIcon from "@material-ui/icons/Lock";
import PeopleIcon from "@material-ui/icons/People";
import SettingsIcon from "@material-ui/icons/Settings";
import SwapCallsIcon from "@material-ui/icons/SwapCalls";
import TimelineIcon from "@material-ui/icons/Timeline";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "./nav-link";
import { useRouteParams } from "ui/routes/definition";
import { DailyReportRoute } from "ui/routes/absence-vacancy/daily-report";
import { VerifyRoute } from "ui/routes/absence-vacancy/verify";
import { LocationsRoute } from "ui/routes/locations";
import { SchoolGroupsRoute } from "ui/routes/school-groups";
import { CalendarThisYearRoute } from "ui/routes/calendar/this-year";
import { CalendarPastYearsRoute } from "ui/routes/calendar/past-years";
import { SecurityUsersRoute } from "ui/routes/security/users";
import { SecurityPermissionSetsRoute } from "ui/routes/security/permission-sets";
import { SecurityPartnersRoute } from "ui/routes/security/partners";
import { SecurityManagedOrganizationsRoute } from "ui/routes/security/managed-organizations";

type Props = {
  className?: string;
  route: string;
  navBarExpanded: boolean;
  onClick?: () => void;
};

export const HomeNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return <NavLink exact title={t("Home")} icon={<HomeIcon />} {...props} />;
};

export const AbsenceNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  const paramsDailyReport = useRouteParams(DailyReportRoute);
  const paramsVerify = useRouteParams(VerifyRoute);
  return (
    <NavLink
      title={t("Absence & Vacancy")}
      icon={<SwapCallsIcon />}
      subNavItems={[
        {
          title: t("Daily Report"),
          route: DailyReportRoute.generate(paramsDailyReport),
        },
        {
          title: t("Verify"),
          route: VerifyRoute.generate(paramsVerify),
        },
      ]}
      {...props}
    />
  );
};

export const AnalyticsAndReportsNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("Analytics & Reports")}
      icon={<TimelineIcon />}
      {...props}
    />
  );
};

export const SchoolsNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  const paramsLocations = useRouteParams(LocationsRoute);
  const paramsGroups = useRouteParams(SchoolGroupsRoute);
  return (
    <NavLink
      title={t("Schools")}
      icon={<LocationCityIcon />}
      subNavItems={[
        {
          title: t("Schools"),
          route: LocationsRoute.generate(paramsLocations),
        },
        {
          title: t("School Groups"),
          route: SchoolGroupsRoute.generate(paramsGroups),
        },
      ]}
      {...props}
    />
  );
};

export const PeopleNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return <NavLink title={t("People")} icon={<PeopleIcon />} {...props} />;
};

export const CalendarNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return <NavLink title={t("Calendars")} icon={<DateRangeIcon />} {...props} />;
};

export const ConfigurationNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink title={t("Configuration")} icon={<SettingsIcon />} {...props} />
  );
};

export const SecurityNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  const paramsSecurityUsers = useRouteParams(SecurityUsersRoute);
  const paramsSecurityPermissionSets = useRouteParams(
    SecurityPermissionSetsRoute
  );
  const paramsSecurityPartners = useRouteParams(SecurityPartnersRoute);
  const paramsSecurityManagedOrganizations = useRouteParams(
    SecurityManagedOrganizationsRoute
  );
  return (
    <NavLink
      title={t("Security")}
      icon={<LockIcon />}
      subNavItems={[
        {
          title: t("Users"),
          route: SecurityUsersRoute.generate(paramsSecurityUsers),
        },
        {
          title: t("Permission Sets"),
          route: SecurityPermissionSetsRoute.generate(
            paramsSecurityPermissionSets
          ),
        },
        {
          title: t("Partners"),
          route: SecurityPartnersRoute.generate(paramsSecurityPartners),
        },
        {
          title: t("Managed Organizations"),
          route: SecurityManagedOrganizationsRoute.generate(
            paramsSecurityManagedOrganizations
          ),
        },
      ]}
      {...props}
    />
  );
};

export const MyScheduleNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink title={t("My Schedule")} icon={<DateRangeIcon />} {...props} />
  );
};

export const PTOBalancesNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("PTO Balances")}
      icon={<AccountBalanceWalletIcon />}
      {...props}
    />
  );
};

export const SubPreferencesNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink title={t("Sub Preferences")} icon={<SettingsIcon />} {...props} />
  );
};

export const MyProfileNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink title={t("My Profile")} icon={<AccountCircleIcon />} {...props} />
  );
};

export const HelpNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return <NavLink title={t("Help")} icon={<HelpOutlineIcon />} {...props} />;
};

export const SignOutNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("Sign Out")}
      icon={<ExitToAppIcon />}
      route={"/404"}
      {...props}
    />
  );
};

export const OrganizationsNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink title={t("Organizations")} icon={<BusinessIcon />} {...props} />
  );
};

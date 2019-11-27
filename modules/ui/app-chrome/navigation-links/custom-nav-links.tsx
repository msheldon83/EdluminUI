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

type Props = {
  className?: string;
  route: string;
  onClick?: () => void;
};

export const HomeNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return <NavLink exact title={t("Home")} icon={<HomeIcon />} {...props} />;
};

export const AbsenceNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("Absences & Vacancies")}
      icon={<SwapCallsIcon />}
      subNavItems={[
        { title: t("Daily Report"), route: "1" },
        { title: t("Verify"), route: "2" },
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
  return (
    <NavLink
      title={t("Schools")}
      icon={<LocationCityIcon />}
      subNavItems={[
        { title: t("Schools"), route: "3" },
        { title: t("School Groups"), route: "4" },
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
  return (
    <NavLink
      title={t("Calendars")}
      icon={<DateRangeIcon />}
      subNavItems={[
        { title: t("This Year"), route: "5" },
        { title: t("Past Years"), route: "6" },
      ]}
      {...props}
    />
  );
};

export const ConfigurationNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink title={t("Configuration")} icon={<SettingsIcon />} {...props} />
  );
};

export const SecurityNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("Security")}
      icon={<LockIcon />}
      subNavItems={[
        { title: t("Users"), route: "7" },
        { title: t("Permission Sets"), route: "8" },
        { title: t("Partners"), route: "9" },
        { title: t("Managed Organizations"), route: "10" },
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

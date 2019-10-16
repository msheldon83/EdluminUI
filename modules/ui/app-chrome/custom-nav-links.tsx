import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
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
import { Index } from "ui/routes";
import { NavLink } from "./nav-link";

type Props = {
  className?: string;
};

export const HomeNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("Home")}
      icon={<HomeIcon />}
      route={Index.PATH_TEMPLATE}
      {...props}
    />
  );
};

export const AbsenceNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("Absences & Vacancies")}
      icon={<SwapCallsIcon />}
      route={"/"}
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
      route={"/"}
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
      route={"/"}
      {...props}
    />
  );
};

export const PeopleNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink title={t("People")} icon={<PeopleIcon />} route={"/"} {...props} />
  );
};

export const CalendarNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("Calendars")}
      icon={<DateRangeIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const ConfigurationNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("Configuration")}
      icon={<SettingsIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const SecurityNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink title={t("Security")} icon={<LockIcon />} route={"/"} {...props} />
  );
};

export const MyScheduleNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("My Schedule")}
      icon={<DateRangeIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const PTOBalancesNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("PTO Balances")}
      icon={<AccountBalanceWalletIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const SubPreferencesNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("Sub Preferences")}
      icon={<SettingsIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const MyProfileNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("My Profile")}
      icon={<AccountCircleIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const HelpNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("Help")}
      icon={<HelpOutlineIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const SignOutNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("Sign Out")}
      icon={<ExitToAppIcon />}
      route={"/"}
      {...props}
    />
  );
};

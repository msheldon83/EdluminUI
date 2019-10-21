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
import { useParams, useRouteMatch } from "react-router";
import { Profile } from "ui/routes/profile";
import { AppChrome } from "ui/routes/app-chrome";

type Props = {
  className?: string;
  onClick?: () => void;
};

export const HomeNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useParams<AppChrome.Params>();
  return (
    <NavLink
      title={t("Home")}
      icon={<HomeIcon />}
      route={AppChrome.generate(params)}
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
      route={"/404"}
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
      route={"/404"}
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
      route={"/404"}
      {...props}
    />
  );
};

export const PeopleNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("People")}
      icon={<PeopleIcon />}
      route={"/404"}
      {...props}
    />
  );
};

export const CalendarNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("Calendars")}
      icon={<DateRangeIcon />}
      route={"/404"}
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
      route={"/404"}
      {...props}
    />
  );
};

export const SecurityNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("Security")}
      icon={<LockIcon />}
      route={"/404"}
      {...props}
    />
  );
};

export const MyScheduleNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("My Schedule")}
      icon={<DateRangeIcon />}
      route={"/404"}
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
      route={"/404"}
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
      route={"/404"}
      {...props}
    />
  );
};

export const MyProfileNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useParams<AppChrome.Params>();
  return (
    <NavLink
      title={t("My Profile")}
      icon={<AccountCircleIcon />}
      route={Profile.generate(params)}
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
      route={"/404"}
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
      route={"/404"}
      {...props}
    />
  );
};

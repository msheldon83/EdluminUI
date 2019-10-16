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
import { Trans } from "react-i18next";
import { NavLink } from "./nav-link";
import { Index } from "ui/routes";

type Props = {
  className?: string;
};

export const HomeNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="home">Home</Trans>}
      icon={<HomeIcon />}
      route={Index.PATH_TEMPLATE}
      {...props}
    />
  );
};

export const AbsenceNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="absencesAndVacancies">Absences & Vacancies</Trans>}
      icon={<SwapCallsIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const AnalyticsAndReportsNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="analyticsAndReports">Analytics & Reports</Trans>}
      icon={<TimelineIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const SchoolsNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="schools">Schools</Trans>}
      icon={<LocationCityIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const PeopleNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="people">People</Trans>}
      icon={<PeopleIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const CalendarNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="calendars">Calendars</Trans>}
      icon={<DateRangeIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const ConfigurationNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="configuration">Configuration</Trans>}
      icon={<SettingsIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const SecurityNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="security">Security</Trans>}
      icon={<LockIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const MyScheduleNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="mySchedule">My Schedule</Trans>}
      icon={<DateRangeIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const PTOBalancesNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="ptoBalances">PTO Balances</Trans>}
      icon={<AccountBalanceWalletIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const SubPreferencesNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="subPreferences">Sub Preferences</Trans>}
      icon={<SettingsIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const MyProfileNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="myProfile">My Profile</Trans>}
      icon={<AccountCircleIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const HelpNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="help">Help</Trans>}
      icon={<HelpOutlineIcon />}
      route={"/"}
      {...props}
    />
  );
};

export const SignOutNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="signOut">Sign Out</Trans>}
      icon={<ExitToAppIcon />}
      route={"/"}
      {...props}
    />
  );
};

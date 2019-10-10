import * as React from "react";
import HomeIcon from "@material-ui/icons/Home";
import SwapCallsIcon from "@material-ui/icons/SwapCalls";
import TimelineIcon from "@material-ui/icons/Timeline";
import LocationCityIcon from "@material-ui/icons/LocationCity";
import PeopleIcon from "@material-ui/icons/People";
import DateRangeIcon from "@material-ui/icons/DateRange";
import SettingsIcon from "@material-ui/icons/Settings";
import LockIcon from "@material-ui/icons/Lock";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { NavLink } from "./nav-link";
import { Trans } from "react-i18next";

type Props = {};

export const HomeNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="home">Home</Trans>}
      icon={<HomeIcon />}
      route={"/"}
    />
  );
};

export const AbsenceNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="absencesAndVacancies">Absences & Vacancies</Trans>}
      icon={<SwapCallsIcon />}
      route={"/"}
    />
  );
};

export const AnalyticsAndReportsNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="analyticsAndReports">Analytics & Reports</Trans>}
      icon={<TimelineIcon />}
      route={"/"}
    />
  );
};

export const SchoolsNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="schools">Schools</Trans>}
      icon={<LocationCityIcon />}
      route={"/"}
    />
  );
};

export const PeopleNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="people">People</Trans>}
      icon={<PeopleIcon />}
      route={"/"}
    />
  );
};

export const CalendarNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="calendars">Calendars</Trans>}
      icon={<DateRangeIcon />}
      route={"/"}
    />
  );
};

export const ConfigurationNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="configuration">Configuration</Trans>}
      icon={<SettingsIcon />}
      route={"/"}
    />
  );
};

export const SecurityNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="security">Security</Trans>}
      icon={<LockIcon />}
      route={"/"}
    />
  );
};

export const MyScheduleNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="mySchedule">My Schedule</Trans>}
      icon={<DateRangeIcon />}
      route={"/"}
    />
  );
};

export const PTOBalancesNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="ptoBalances">PTO Balances</Trans>}
      icon={<AccountBalanceWalletIcon />}
      route={"/"}
    />
  );
};

export const SubPreferencesNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="subPreferences">Sub Preferences</Trans>}
      icon={<SettingsIcon />}
      route={"/"}
    />
  );
};

export const HelpNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="help">Help</Trans>}
      icon={<HelpOutlineIcon />}
      route={"/"}
    />
  );
};

export const SignOutNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={<Trans i18nKey="signOut">Sign Out</Trans>}
      icon={<ExitToAppIcon />}
      route={"/"}
    />
  );
};

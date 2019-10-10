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

type Props = {};

export const HomeNavLink: React.FC<Props> = props => {
  return <NavLink title={"Home"} icon={<HomeIcon />} route={"/"} />;
};

export const AbsenceNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={"Absences & Vacancies"}
      icon={<SwapCallsIcon />}
      route={"/"}
    />
  );
};

export const AnalyticsAndReportsNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={"Analytics & Reports"}
      icon={<TimelineIcon />}
      route={"/"}
    />
  );
};

export const SchoolsNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={"Analytics & Reports"}
      icon={<LocationCityIcon />}
      route={"/"}
    />
  );
};

export const PeopleNavLink: React.FC<Props> = props => {
  return <NavLink title={"People"} icon={<PeopleIcon />} route={"/"} />;
};

export const CalendarNavLink: React.FC<Props> = props => {
  return <NavLink title={"Calendars"} icon={<DateRangeIcon />} route={"/"} />;
};

export const ConfigurationNavLink: React.FC<Props> = props => {
  return (
    <NavLink title={"Configuration"} icon={<SettingsIcon />} route={"/"} />
  );
};

export const SecurityNavLink: React.FC<Props> = props => {
  return <NavLink title={"Security"} icon={<LockIcon />} route={"/"} />;
};

export const MyScheduleNavLink: React.FC<Props> = props => {
  return <NavLink title={"My Schedule"} icon={<DateRangeIcon />} route={"/"} />;
};

export const PTOBalancesNavLink: React.FC<Props> = props => {
  return (
    <NavLink
      title={"PTO Balances"}
      icon={<AccountBalanceWalletIcon />}
      route={"/"}
    />
  );
};

export const SubPreferencesNavLink: React.FC<Props> = props => {
  return (
    <NavLink title={"Sub Preferences"} icon={<SettingsIcon />} route={"/"} />
  );
};

export const HelpNavLink: React.FC<Props> = props => {
  return <NavLink title={"Help"} icon={<HelpOutlineIcon />} route={"/"} />;
};

export const SignOutNavLink: React.FC<Props> = props => {
  return <NavLink title={"Sign Out"} icon={<ExitToAppIcon />} route={"/"} />;
};

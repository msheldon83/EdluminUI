import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import * as React from "react";
import { Trans } from "react-i18next";
import { MenuLink } from "./menu-link";

type Props = {
  className?: string;
};

export const MyProfileMenuLink: React.FC<Props> = props => {
  return (
    <MenuLink
      title={<Trans i18nKey="myProfile">My Profile</Trans>}
      icon={<AccountCircleIcon />}
      {...props}
    />
  );
};

export const SignOutMenuLink: React.FC<Props> = props => {
  return (
    <MenuLink
      title={<Trans i18nKey="signOut">Sign Out</Trans>}
      icon={<ExitToAppIcon />}
      {...props}
    />
  );
};

export const HelpMenuLink: React.FC<Props> = props => {
  return (
    <MenuLink
      title={<Trans i18nKey="help">Help</Trans>}
      icon={<HelpOutlineIcon />}
      {...props}
    />
  );
};

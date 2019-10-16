import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import * as React from "react";
import { Trans } from "react-i18next";
import { MenuLink } from "./menu-link";
import { Profile } from "ui/routes/profile";
import { Index } from "ui/routes";
import { useAuth0 } from "auth/auth0";

type Props = {
  className?: string;
};

export const MyProfileMenuLink: React.FC<Props> = props => {
  return (
    <MenuLink
      title={<Trans i18nKey="myProfile">My Profile</Trans>}
      icon={<AccountCircleIcon />}
      route={Profile.PATH_TEMPLATE}
      {...props}
    />
  );
};

export const SignOutMenuLink: React.FC<Props> = props => {
  const auth0 = useAuth0();
  return (
    <MenuLink
      title={<Trans i18nKey="signOut">Sign Out</Trans>}
      icon={<ExitToAppIcon />}
      route={Index.PATH_TEMPLATE}
      onClick={auth0.logout}
      {...props}
    />
  );
};

export const HelpMenuLink: React.FC<Props> = props => {
  return (
    <MenuLink
      title={<Trans i18nKey="help">Help</Trans>}
      icon={<HelpOutlineIcon />}
      route={Index.PATH_TEMPLATE}
      {...props}
    />
  );
};

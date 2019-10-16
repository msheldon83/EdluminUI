import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { MenuLink } from "./menu-link";
import { Profile } from "ui/routes/profile";
import { Index } from "ui/routes";
import { useAuth0 } from "auth/auth0";

type Props = {
  className?: string;
};

export const MyProfileMenuLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <MenuLink
      title={t("My Profile")}
      icon={<AccountCircleIcon />}
      route={Profile.PATH_TEMPLATE}
      {...props}
    />
  );
};

export const SignOutMenuLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  const auth0 = useAuth0();
  return (
    <MenuLink
      title={t("Sign Out")}
      icon={<ExitToAppIcon />}
      route={Index.PATH_TEMPLATE}
      onClick={auth0.logout}
      {...props}
    />
  );
};

export const HelpMenuLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <MenuLink
      title={t("Help")}
      icon={<HelpOutlineIcon />}
      route={Index.PATH_TEMPLATE}
      {...props}
    />
  );
};

import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { MenuLink } from "./menu-link";
import { Profile } from "ui/routes/profile";
import { Index } from "ui/routes";
import { useAuth0 } from "auth/auth0";
import { useRouteMatch, useParams } from "react-router";
import { AppChrome } from "ui/routes/app-chrome";

type Props = {
  className?: string;
  onClick?: () => void;
};

export const MyProfileMenuLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useParams<Profile.Params>();
  return (
    <MenuLink
      title={t("My Profile")}
      icon={<AccountCircleIcon />}
      route={Profile.generate(params)}
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
      {...props}
      onClick={auth0.logout}
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

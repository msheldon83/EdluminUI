import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { MenuLink } from "./menu-link";
import { ProfileRoute } from "ui/routes/profile";
import { useAuth0 } from "auth/auth0";
import { useRouteMatch, useParams } from "react-router";
import { AppChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";

type Props = {
  className?: string;
  onClick?: () => void;
};

export const MyProfileMenuLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(AppChromeRoute);
  return (
    <MenuLink
      title={t("My Profile")}
      icon={<AccountCircleIcon />}
      route={ProfileRoute.generate(params)}
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
      {...props}
      onClick={() => {
        window.open("https://help.redroverk12.com", "_blank");
      }}
    />
  );
};

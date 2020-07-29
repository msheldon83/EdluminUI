import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import * as React from "react";
import { useTranslation } from "react-i18next";
import ContactPhoneIcon from "@material-ui/icons/ContactPhone";
import { MenuLink } from "./menu-link";
import { ProfileRoute, AdminProfileRoute } from "ui/routes/profile";
import { useAuth0 } from "auth/auth0";
import { AppChromeRoute } from "ui/routes/app-chrome";
import { OrganizationContactInfoRoute } from "ui/routes/organizations";
import { useRouteParams } from "ui/routes/definition";
import { getOrgIdFromRoute } from "core/org-context";
import CannyIcon from "@material-ui/icons/WbIncandescentOutlined";
import { makeStyles } from "@material-ui/core";
import { AdminFeedbackRoute } from "ui/routes/feedback";
import { useMyUserAccess } from "reference-data/my-user-access";

type Props = {
  className?: string;
  onClick?: () => void;
  onClose: () => void;
};

export const MyProfileMenuLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(AppChromeRoute);
  const orgId = getOrgIdFromRoute();

  return (
    <MenuLink
      title={t("My Profile")}
      icon={<AccountCircleIcon />}
      route={
        params.role === "admin" && orgId !== undefined
          ? AdminProfileRoute.generate({ organizationId: orgId })
          : ProfileRoute.generate(params)
      }
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

export const OrganizationContactMenuLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(AppChromeRoute);
  return (
    <MenuLink
      title={t("District Contact info")}
      icon={<ContactPhoneIcon />}
      route={OrganizationContactInfoRoute.generate(params)}
      {...props}
    />
  );
};

const showFeedbackMenuLink = () => {
  const userAccess = useMyUserAccess();
  const orgUsers = userAccess?.me?.user?.orgUsers;
  if (!orgUsers) return false;
  return (
    orgUsers.filter(function(orgUser) {
      return orgUser?.administrator?.isSuperUser;
    }).length > 0
  );
};

export const FeedbackMenuLink: React.FC<Props> = props => {
  const authorized = showFeedbackMenuLink();
  if (!authorized) return <></>;
  const orgId = getOrgIdFromRoute();
  if (!orgId) return <></>;
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <MenuLink
      className={classes.menulink}
      title={t("Ideas")}
      icon={<CannyIcon className={classes.rotated} />}
      route={AdminFeedbackRoute.generate({ organizationId: orgId! })}
      onClick={props.onClose}
      {...props}
    />
  );
};

const useStyles = makeStyles(theme => ({
  rotated: {
    transform: "rotate(180deg)",
  },
  menulink: {
    color: theme.customColors.darkGray,
  },
}));

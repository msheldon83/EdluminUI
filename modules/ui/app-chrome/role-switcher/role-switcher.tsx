import { MenuList, makeStyles } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import React = require("react");
import { withRouter } from "react-router";
import { MenuLink } from "../menu-link";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorElement: null | HTMLElement;
};

type RoleProps = {
  title: string;
  route: string;
  onClick: string;
};

export const RoutedOrgUserRole: React.FC<Props> = props => {
  const classes = useStyles();
  const userMenuListClasses = useUserMenuListStyles();

  return (
    <Menu
      id="org-user-menu"
      open={props.open}
      onClose={props.onClose}
      anchorEl={props.anchorElement}
      getContentAnchorEl={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      classes={userMenuListClasses}
    >
      <MenuList variant="menu" className={classes.menuList}>
        <Administrator className={classes.userMenuLink} />
        <Employee className={classes.userMenuLink} />
        <ReplacementEmployee className={classes.userMenuLink} />
      </MenuList>
    </Menu>
  );
};

export const UserMenu = withRouter(RoutedOrgUserRole);

//Need Correct Routes
export const Administrator: React.FC<RoleProps> = props => {
  const { t } = useTranslation();
  return (
    <MenuLink
      title={t("Administrator")}
      route={Index.PATH_TEMPLATE}
      onClick={auth0.logout}
      {...props}
    />
  );
};

export const Employee: React.FC<RoleProps> = props => {
  const { t } = useTranslation();
  return (
    <MenuLink
      title={t("Employee")}
      route={Index.PATH_TEMPLATE}
      onClick={auth0.logout}
      {...props}
    />
  );
};

export const ReplacementEmployee: React.FC<RoleProps> = props => {
  const { t } = useTranslation();
  return (
    <MenuLink
      title={t("Replacement Employee")}
      route={Index.PATH_TEMPLATE}
      onClick={auth0.logout}
      {...props}
    />
  );
};

const useStyles = makeStyles(theme => ({
  menuList: {
    padding: `${theme.typography.pxToRem(4)} 0`,
  },
  userMenuLink: {
    paddingRight: theme.spacing(3),
    color: theme.customColors.darkGray,
    "&:hover": {
      color: theme.customColors.black,
    },
  },
}));

const useUserMenuListStyles = makeStyles(theme => ({
  list: { padding: 0 },
}));

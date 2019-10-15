import * as React from "react";
import Menu from "@material-ui/core/Menu";
import {
  MyProfileNavLink,
  SignOutNavLink,
  HelpNavLink,
} from "../custom-nav-links";
import { makeStyles } from "@material-ui/styles";
import { MenuList, MenuItem } from "@material-ui/core";
import {
  MyProfileMenuLink,
  SignOutMenuLink,
  HelpMenuLink,
} from "../custom-menu-links";
import { useAuth0 } from "auth/auth0";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Profile } from "ui/routes/profile";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorElement: null | HTMLElement;
} & RouteComponentProps;

export const RoutedUserMenu: React.FC<Props> = props => {
  const classes = useStyles();
  const userMenuListClasses = useUserMenuListStyles();
  const auth0 = useAuth0();

  return (
    <Menu
      keepMounted
      id="user-menu"
      open={props.open}
      onClose={props.onClose}
      anchorEl={props.anchorElement}
      getContentAnchorEl={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      classes={userMenuListClasses}
    >
      <MenuList variant="menu" className={classes.menuList}>
        <MyProfileMenuLink
          onClick={() => props.history.push(Profile.PATH_TEMPLATE)}
          className={classes.userMenuLink}
        />
        <SignOutMenuLink
          onClick={auth0.logout}
          className={classes.userMenuLink}
        />
        <HelpMenuLink onClick={() => {}} className={classes.userMenuLink} />
      </MenuList>
    </Menu>
  );
};

export const UserMenu = withRouter(RoutedUserMenu);

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

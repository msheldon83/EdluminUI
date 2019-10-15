import * as React from "react";
import Menu from "@material-ui/core/Menu";
import {
  MyProfileNavLink,
  SignOutNavLink,
  HelpNavLink,
} from "../custom-nav-links";
import { makeStyles } from "@material-ui/styles";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorElement: null | HTMLElement;
};

export const UserMenu: React.FC<Props> = props => {
  const classes = useStyles();
  const userMenuListClasses = useUserMenuListStyles();
  return (
    <Menu
      keepMounted
      id="user-menu"
      open={props.open}
      onClose={props.onClose}
      anchorEl={props.anchorElement}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      classes={userMenuListClasses}
    >
      <MyProfileNavLink className={classes.userMenuLink} />
      <SignOutNavLink className={classes.userMenuLink} />
      <HelpNavLink className={classes.userMenuLink} />
    </Menu>
  );
};

const useStyles = makeStyles(theme => ({
  userMenuLink: {
    color: theme.customColors.darkGray,
    borderRadius: 0,
    "&:hover": {
      color: theme.customColors.black,
      backgroundColor: theme.customColors.medLightGray,
    },
  },
}));

const useUserMenuListStyles = makeStyles(theme => ({
  list: { padding: 0 },
}));

import { MenuList } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import {
  HelpMenuLink,
  MyProfileMenuLink,
  SignOutMenuLink,
} from "../custom-menu-links";

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
          onClick={props.onClose}
          className={classes.userMenuLink}
        />
        <SignOutMenuLink
          onClick={props.onClose}
          className={classes.userMenuLink}
        />
        <HelpMenuLink
          onClick={props.onClose}
          className={classes.userMenuLink}
        />
      </MenuList>
    </Menu>
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

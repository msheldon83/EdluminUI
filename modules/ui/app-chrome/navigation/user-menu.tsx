import { MenuList } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import {
  HelpMenuLink,
  MyProfileMenuLink,
  SignOutMenuLink,
} from "../custom-menu-links";
import { useIsImpersonating } from "reference-data/is-impersonating";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorElement: null | HTMLElement;
};

export const UserMenu: React.FC<Props> = props => {
  const classes = useStyles();
  const userMenuListClasses = useUserMenuListStyles();

  const isImpersonating = useIsImpersonating();

  return (
    <Menu
      id="user-menu"
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
        {!isImpersonating && (
          <MyProfileMenuLink
            onClick={props.onClose}
            className={classes.userMenuLink}
          />
        )}
        <SignOutMenuLink
          onClick={props.onClose}
          className={classes.userMenuLink}
        />
        {/* ml 1-29-20 -- for the initial release phase, we are
            moving the help link to the top bar. Long term, it
            belongs here */}
        {/* <HelpMenuLink
          onClick={props.onClose}
          className={classes.userMenuLink}
        /> */}
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

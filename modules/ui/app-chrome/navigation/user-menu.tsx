import { MenuList } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { MyProfileMenuLink, SignOutMenuLink } from "../custom-menu-links";
import { useIsImpersonating } from "reference-data/is-impersonating";
import { useMyUserAccess } from "reference-data/my-user-access";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorElement: null | HTMLElement;
};

export const UserMenu: React.FC<Props> = props => {
  const classes = useStyles();
  const userMenuListClasses = useUserMenuListStyles();
  const userAccess = useMyUserAccess();
  const actualUser = userAccess?.me?.actualUser;

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
        {(!isImpersonating || actualUser?.isSystemAdministrator) && (
          <MyProfileMenuLink
            onClick={props.onClose}
            className={classes.userMenuLink}
          />
        )}
        <SignOutMenuLink
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

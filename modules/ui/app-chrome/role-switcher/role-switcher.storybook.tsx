import { MenuList, makeStyles } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import React = require("react");
import {
  //swap out for Role's? Admin/Employee/Replacement
  HelpMenuLink,
  MyProfileMenuLink,
  SignOutMenuLink,
} from "../custom-menu-links";
import { withRouter } from "react-router";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorElement: null | HTMLElement;
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
        <MyProfileMenuLink className={classes.userMenuLink} />
        <SignOutMenuLink className={classes.userMenuLink} />
        <HelpMenuLink className={classes.userMenuLink} />
      </MenuList>
    </Menu>
  );
};

export const UserMenu = withRouter(RoutedOrgUserRole);

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

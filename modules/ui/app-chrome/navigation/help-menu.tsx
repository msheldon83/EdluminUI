import { MenuList, IconButton } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import { AppChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";
import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import {
  HelpMenuLink,
  OrganizationContactMenuLink,
  FeedbackMenuLink,
} from "../custom-menu-links";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorElement: null | HTMLElement;
};

export const HelpMenu: React.FC<Props> = props => {
  const classes = useStyles();
  const userMenuListClasses = useUserMenuListStyles();

  const params = useRouteParams(AppChromeRoute);

  return (
    <Menu
      id="help-menu"
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
        <HelpMenuLink
          onClick={props.onClose}
          className={classes.userMenuLink}
        />
        {params.role !== "admin" && (
          <OrganizationContactMenuLink
            onClick={props.onClose}
            className={classes.userMenuLink}
          />
        )}
        <FeedbackMenuLink
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

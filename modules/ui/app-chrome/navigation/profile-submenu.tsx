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

export const ProfileSubMenu: React.FC<Props> = props => {
  const classes = useStyles();
  return (
    <div>
      <Menu
        keepMounted
        id="profileMenu"
        open={props.open}
        onClose={props.onClose}
        anchorEl={props.anchorElement}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <MyProfileNavLink
          className={classes.subMenuLink}
          iconClassName={classes.subMenuIcon}
          textClassName={classes.subMenuText}
        />
        <SignOutNavLink
          className={classes.subMenuLink}
          iconClassName={classes.subMenuIcon}
          textClassName={classes.subMenuText}
        />
        <HelpNavLink
          className={classes.subMenuLink}
          iconClassName={classes.subMenuIcon}
          textClassName={classes.subMenuText}
        />
      </Menu>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  subMenuLink: {
    opacity: 1,
    borderRadius: 0,
    "&:hover": {
      backgroundColor: theme.customColors.medLightGray,
    },
  },
  subMenuIcon: {
    color: theme.customColors.black,
  },
  subMenuText: {
    color: theme.customColors.black,
  },
}));

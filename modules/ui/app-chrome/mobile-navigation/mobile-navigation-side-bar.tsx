import {
  Divider,
  Drawer,
  Grid,
  List,
  makeStyles,
  Button,
  Link as MUILink,
} from "@material-ui/core";
import * as React from "react";
import { Link } from "react-router-dom";
import { RedRoverLogo } from "ui/components/red-rover-logo";
import { ProfileAvatar } from "ui/components/profile-avatar/profile-avatar";
import { AppChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";
import { ProfileRoute } from "ui/routes/profile";
import { AutoSwitchingNavLinks } from "../navigation-links/role-nav-links";
import { RoleSwitcher } from "../role-switcher";
import { MobileSearchBar } from "./mobile-search";
import { useAuth0 } from "auth/auth0";
import { ExitToApp, HelpOutline } from "@material-ui/icons";
import { useTranslation } from "react-i18next";

type Props = {
  expanded: boolean;
  collapse: () => void;
};

export const MobileNavigationSideBar: React.FC<Props> = props => {
  const classes = useStyles();
  const params = useRouteParams(AppChromeRoute);
  const auth0 = useAuth0();
  const { t } = useTranslation();

  return (
    <Drawer
      open={props.expanded}
      onClose={props.collapse}
      variant="temporary"
      classes={{
        paper: classes.drawer,
      }}
    >
      <Grid item className={classes.avatarContainer}>
        <Link
          to={ProfileRoute.generate(params)}
          onClick={() => {
            props.collapse();
          }}
          className={classes.link}
        >
          <ProfileAvatar className={classes.avatar} />
        </Link>
      </Grid>
      <RoleSwitcher expanded />
      <Divider className={classes.divider} />
      <div className={classes.searchBar}>
        <MobileSearchBar />
      </div>
      <List className={classes.list}>
        <AutoSwitchingNavLinks
          onClick={props.collapse}
          navBarExpanded={props.expanded}
        />
      </List>

      <Grid container justify="space-between" className={classes.userItems}>
        <Button
          color="inherit"
          startIcon={<ExitToApp />}
          onClick={auth0.logout}
        >
          {t("Sign Out")}
        </Button>

        <Button
          color="inherit"
          startIcon={<HelpOutline />}
          component={MUILink}
          target={"_blank"}
          href={"https://help.redroverk12.com"}
        >
          {t("Help")}
        </Button>
      </Grid>
      <RedRoverLogo />
    </Drawer>
  );
};

const useStyles = makeStyles(theme => ({
  drawer: {
    background: theme.customColors.edluminSlate,
    display: "flex",
    flexDirection: "column",
  },
  divider: {
    background: theme.customColors.edluminLightSlate,
  },
  link: { textDecoration: "none" },
  avatarContainer: {
    padding: theme.spacing(2),
  },
  avatar: {
    height: theme.typography.pxToRem(60),
    width: theme.typography.pxToRem(60),
  },
  searchBar: {
    paddingTop: theme.spacing(2),
  },
  list: {
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    flexGrow: 1,
  },
  userItems: {
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    color: theme.customColors.white,
  },
}));

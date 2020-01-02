import { Divider, Drawer, Grid, List, makeStyles } from "@material-ui/core";
import * as React from "react";
import { Link } from "react-router-dom";
import { EdluminLogo } from "ui/components/edlumin-logo";
import { ProfileAvatar } from "ui/components/profile-avatar/profile-avatar";
import { AppChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";
import { ProfileRoute } from "ui/routes/profile";
import { AutoSwitchingNavLinks } from "../navigation-links/role-nav-links";
import { RoleSwitcher } from "../role-switcher";
import { MobileSearchBar } from "./mobile-search";

type Props = {
  expanded: boolean;
  collapse: () => void;
};

export const MobileNavigationSideBar: React.FC<Props> = props => {
  const classes = useStyles();
  const params = useRouteParams(AppChromeRoute);

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
      <EdluminLogo />
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
}));

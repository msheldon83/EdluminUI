import { Divider, Drawer, Grid, List, makeStyles } from "@material-ui/core";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Link } from "react-router-dom";
import { EdluminLogo } from "ui/components/edlumin-logo";
import { Profile } from "ui/routes/profile";
import {
  AbsenceNavLink,
  AnalyticsAndReportsNavLink,
  CalendarNavLink,
  ConfigurationNavLink,
  HelpNavLink,
  HomeNavLink,
  MyScheduleNavLink,
  PeopleNavLink,
  PTOBalancesNavLink,
  SchoolsNavLink,
  SecurityNavLink,
  SignOutNavLink,
  SubPreferencesNavLink,
} from "../custom-nav-links";
import { MobileSearchBar } from "./mobile-search";
import { ProfileAvatar } from "ui/components/profile-avatar/profile-avatar";

type Props = {
  expanded: boolean;
  collapse: () => void;
} & RouteComponentProps;

export const RoutedMobileNavigationSideBar: React.FC<Props> = props => {
  const classes = useStyles();
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
          to={Profile.PATH_TEMPLATE}
          onClick={() => {
            props.collapse();
          }}
          className={classes.link}
        >
          <ProfileAvatar className={classes.avatar} />
        </Link>
      </Grid>

      <Divider className={classes.divider} />
      <div className={classes.searchBar}>
        <MobileSearchBar />
      </div>
      <List className={classes.list}>
        <HomeNavLink />
        <AbsenceNavLink />
        <AnalyticsAndReportsNavLink />
        <SchoolsNavLink />
        <PeopleNavLink />
        <CalendarNavLink />
        <ConfigurationNavLink />
        <SecurityNavLink />
        <MyScheduleNavLink />
        <PTOBalancesNavLink />
        <SubPreferencesNavLink />
        <HelpNavLink />
        <SignOutNavLink />
      </List>

      <EdluminLogo />
    </Drawer>
  );
};

export const MobileNavigationSideBar = withRouter(
  RoutedMobileNavigationSideBar
);

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

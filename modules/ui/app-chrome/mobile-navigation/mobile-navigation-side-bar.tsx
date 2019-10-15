import { Drawer, Grid, makeStyles, List, Divider } from "@material-ui/core";
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
import * as React from "react";
import { ProfileAvatar } from "../profile-avatar";
import { EdluminLogo } from "ui/components/edlumin-logo";
import { MobileSearchBar } from "./mobile-search";

type Props = {
  expanded: boolean;
  collapse: () => void;
};
export const MobileNavigationSideBar: React.FC<Props> = props => {
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
        <ProfileAvatar className={classes.avatar} />
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

const useStyles = makeStyles(theme => ({
  drawer: {
    background: theme.customColors.edluminSlate,
    display: "flex",
    flexDirection: "column",
  },
  divider: {
    background: theme.customColors.edluminLightSlate,
  },
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

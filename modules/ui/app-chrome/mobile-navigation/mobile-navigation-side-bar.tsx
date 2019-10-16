import {
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  makeStyles,
} from "@material-ui/core";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";
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
import { ProfileAvatar } from "../profile-avatar";
import { MobileSearchBar } from "./mobile-search";

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
        <IconButton
          onClick={() => {
            props.history.push(Profile.PATH_TEMPLATE);
            props.collapse();
          }}
        >
          <ProfileAvatar className={classes.avatar} />
        </IconButton>
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

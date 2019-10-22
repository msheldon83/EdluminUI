import { Divider, Drawer, Grid, List, makeStyles } from "@material-ui/core";
import * as React from "react";
import {
  RouteComponentProps,
  withRouter,
  useParams,
  Route,
  Switch,
} from "react-router";
import { Link } from "react-router-dom";
import { EdluminLogo } from "ui/components/edlumin-logo";
import { ProfileRoute } from "ui/routes/profile";
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
  OrganizationsNavLink,
} from "../navigation-links/custom-nav-links";
import { MobileSearchBar } from "./mobile-search";
import { ProfileAvatar } from "ui/components/profile-avatar/profile-avatar";
import { AppChromeRoute, AdminChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";
import {
  AdminNavLinks,
  EmployeeNavLinks,
} from "../navigation-links/role-nav-links";

type Props = {
  expanded: boolean;
  collapse: () => void;
} & RouteComponentProps;

export const RoutedMobileNavigationSideBar: React.FC<Props> = props => {
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

      <Divider className={classes.divider} />
      <div className={classes.searchBar}>
        <MobileSearchBar />
      </div>
      <List className={classes.list}>
        <Switch>
          <Route path="/employee" component={() => <EmployeeNavLinks />} />
          <Route
            path={AdminChromeRoute.path}
            component={() => <AdminNavLinks />}
          />
        </Switch>
        {/* <HomeNavLink onClick={props.collapse} />
        <AbsenceNavLink onClick={props.collapse} />
        <AnalyticsAndReportsNavLink onClick={props.collapse} />
        <SchoolsNavLink onClick={props.collapse} />
        <PeopleNavLink onClick={props.collapse} />
        <CalendarNavLink onClick={props.collapse} />
        <ConfigurationNavLink onClick={props.collapse} />
        <SecurityNavLink onClick={props.collapse} />
        <OrganizationsNavLink onClick={props.collapse} />
        <MyScheduleNavLink onClick={props.collapse} />
        <PTOBalancesNavLink onClick={props.collapse} />
        <SubPreferencesNavLink onClick={props.collapse} />
        <HelpNavLink onClick={props.collapse} />
        <SignOutNavLink /> */}
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

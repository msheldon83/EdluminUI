import { Divider, Drawer, List, makeStyles } from "@material-ui/core";
import * as React from "react";
import { EdluminLogo } from "ui/components/edlumin-logo";
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
} from "./custom-nav-links";

type Props = {
  expanded: boolean;
  expand: () => void;
  collapse: () => void;
};

export const NavigationSideBar: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <Drawer
      onClose={props.collapse}
      open={props.expanded}
      variant={"permanent"}
      className={props.expanded ? classes.drawerOpen : classes.drawerClose}
      classes={{
        paper: `${classes.drawer} ${
          props.expanded ? classes.drawerOpen : classes.drawerClose
        }`,
      }}
    >
      <EdluminLogo titleClassName={classes.spacing} />

      <Divider />

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
        {/* <HelpNavLink />
        <SignOutNavLink /> */}
      </List>
    </Drawer>
  );
};

const useStyles = makeStyles(theme => ({
  drawer: {
    background: theme.customColors.edluminSlate,
    flexShrink: 0,
  },
  drawerOpen: {
    width: theme.typography.pxToRem(258),
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
    overflowX: "hidden",
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },
  },
  list: {
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  spacing: {
    marginLeft: theme.typography.pxToRem(20),
  },
}));

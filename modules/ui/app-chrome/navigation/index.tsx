import {
  Divider,
  Drawer,
  Grid,
  List,
  makeStyles,
  Typography,
} from "@material-ui/core";
import EmojiObjectsOutlinedIcon from "@material-ui/icons/EmojiObjectsOutlined";
import * as React from "react";
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
  drawerStyle: "temporary" | "permanent";
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
      variant={props.drawerStyle}
      className={props.expanded ? classes.drawerOpen : classes.drawerClose}
      classes={{
        paper: `${classes.drawer} ${
          props.expanded ? classes.drawerOpen : classes.drawerClose
        }`,
      }}
    >
      <Grid
        container
        className={classes.toolbar}
        alignItems="center"
        wrap="nowrap"
      >
        <EmojiObjectsOutlinedIcon fontSize="large" className={classes.logo} />
        <Typography
          display="inline"
          variant={"h2"}
          className={`${classes.text} ${classes.productTitle}`}
        >
          Edlumin
        </Typography>
      </Grid>

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
        <HelpNavLink />
        <SignOutNavLink />
      </List>
    </Drawer>
  );
};

const useStyles = makeStyles(theme => ({
  toolbar: {
    padding: theme.spacing(0, 2),
    overflowX: "hidden",
    ...theme.mixins.toolbar,
  },
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
  logo: {
    color: theme.customColors.marigold,
  },
  productTitle: {
    marginLeft: theme.typography.pxToRem(20),
  },
  text: {
    color: theme.customColors.white,
    fontWeight: 600,
  },
  list: {
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
}));

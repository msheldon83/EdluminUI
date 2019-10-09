import * as React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  makeStyles,
  Typography,
  Grid,
  ListItemIcon,
} from "@material-ui/core";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import MenuIcon from "@material-ui/icons/Menu";
import HomeIcon from "@material-ui/icons/Home";
import SwapCallsIcon from "@material-ui/icons/SwapCalls";
import TimelineIcon from "@material-ui/icons/Timeline";
import LocationCityIcon from "@material-ui/icons/LocationCity";
import PeopleIcon from "@material-ui/icons/People";
import DateRangeIcon from "@material-ui/icons/DateRange";
import SettingsIcon from "@material-ui/icons/Settings";
import LockIcon from "@material-ui/icons/Lock";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import { useBreakpoint, ScreenSize } from "hooks";

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
        justify={props.expanded ? "space-between" : "center"}
        alignItems="center"
      >
        {props.expanded && (
          <Typography variant={"h2"} className={classes.text}>
            Edlumin
          </Typography>
        )}
        {props.expanded ? (
          <IconButton onClick={props.collapse}>
            <ChevronLeftIcon className={classes.text} />
          </IconButton>
        ) : (
          <IconButton
            className={classes.text}
            aria-label="open drawer"
            onClick={props.expand}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
        )}
      </Grid>
      <Divider />
      <List className={classes.list}>
        <ListItem button key={"Home"} className={classes.menuItem}>
          <ListItemIcon className={classes.icon}>
            <HomeIcon />
          </ListItemIcon>
          {props.expanded && (
            <ListItemText
              primary="Home"
              primaryTypographyProps={{ className: classes.text }}
            />
          )}
        </ListItem>
        <ListItem
          button
          key={"Absences & Vacancies"}
          className={classes.menuItem}
        >
          <ListItemIcon className={classes.icon}>
            <SwapCallsIcon />
          </ListItemIcon>
          {props.expanded && (
            <ListItemText
              primary={"Absences & Vacancies"}
              primaryTypographyProps={{ className: classes.text }}
            />
          )}
        </ListItem>
        <ListItem
          button
          key={"Analytics & Reports"}
          className={classes.menuItem}
        >
          <ListItemIcon className={classes.icon}>
            <TimelineIcon />
          </ListItemIcon>
          {props.expanded && (
            <ListItemText
              primary={"Analytics & Reports"}
              primaryTypographyProps={{ className: classes.text }}
            />
          )}
        </ListItem>
        <ListItem button key={"Schools"} className={classes.menuItem}>
          <ListItemIcon className={classes.icon}>
            <LocationCityIcon />
          </ListItemIcon>
          {props.expanded && (
            <ListItemText
              primary="Schools"
              primaryTypographyProps={{ className: classes.text }}
            />
          )}
        </ListItem>
        <ListItem button key={"People"} className={classes.menuItem}>
          <ListItemIcon className={classes.icon}>
            <PeopleIcon />
          </ListItemIcon>
          {props.expanded && (
            <ListItemText
              primary="People"
              primaryTypographyProps={{ className: classes.text }}
            />
          )}
        </ListItem>
        <ListItem button key={"Calendars"} className={classes.menuItem}>
          <ListItemIcon className={classes.icon}>
            <DateRangeIcon />
          </ListItemIcon>
          {props.expanded && (
            <ListItemText
              primary="Calendars"
              primaryTypographyProps={{ className: classes.text }}
            />
          )}
        </ListItem>
        <ListItem button key={"Configuration"} className={classes.menuItem}>
          <ListItemIcon className={classes.icon}>
            <SettingsIcon />
          </ListItemIcon>
          {props.expanded && (
            <ListItemText
              primary="Configuration"
              primaryTypographyProps={{ className: classes.text }}
            />
          )}
        </ListItem>
        <ListItem button key={"Security"} className={classes.menuItem}>
          <ListItemIcon className={classes.icon}>
            <LockIcon />
          </ListItemIcon>
          {props.expanded && (
            <ListItemText
              primary="Security"
              primaryTypographyProps={{ className: classes.text }}
            />
          )}
        </ListItem>

        <ListItem button key={"My Schedule"} className={classes.menuItem}>
          <ListItemIcon className={classes.icon}>
            <DateRangeIcon />
          </ListItemIcon>
          {props.expanded && (
            <ListItemText
              primary="My Schedule"
              primaryTypographyProps={{ className: classes.text }}
            />
          )}
        </ListItem>
        <ListItem button key={"PTO Balances"} className={classes.menuItem}>
          <ListItemIcon className={classes.icon}>
            <AccountBalanceWalletIcon />
          </ListItemIcon>
          {props.expanded && (
            <ListItemText
              primary="PTO Balances"
              primaryTypographyProps={{ className: classes.text }}
            />
          )}
        </ListItem>
        <ListItem button key={"Sub Preferences"} className={classes.menuItem}>
          <ListItemIcon className={classes.icon}>
            <SettingsIcon />
          </ListItemIcon>
          {props.expanded && (
            <ListItemText
              primary="Sub Preferences"
              primaryTypographyProps={{ className: classes.text }}
            />
          )}
        </ListItem>
      </List>
    </Drawer>
  );
};

const useStyles = makeStyles(theme => ({
  toolbar: {
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  },
  drawer: {
    background: theme.customColors.edluminSlate,
  },
  drawerOpen: {
    width: theme.typography.pxToRem(240),
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },
  },
  icon: {
    minWidth: 0,
    paddingRight: theme.typography.pxToRem(11),
  },
  text: {
    color: theme.customColors.white,
    fontWeight: 600,
  },
  list: {
    paddingRight: theme.typography.pxToRem(8),
    paddingLeft: theme.typography.pxToRem(8),
  },
  menuItem: {
    opacity: 0.7,
    borderRadius: theme.typography.pxToRem(5),
    margin: `${theme.typography.pxToRem(5)} 0`,
    "&:hover": {
      backgroundColor: theme.customColors.edluminLightSlate,
      opacity: 1,
    },
  },
}));

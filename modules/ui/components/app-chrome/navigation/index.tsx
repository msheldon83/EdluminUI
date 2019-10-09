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
        {[
          "Home",
          "Absences & Vacancies",
          "Analytics & Reports",
          "Places",
          "People",
          "Calendars",
          "Configuration",
          "Security",
          "PTO Balances",
          "Schedule",
          "Sub Preferences",
          "My Availability",
        ].map((text, index) => (
          <ListItem button key={text} className={classes.menuItem}>
            <ListItemIcon className={classes.icon}>
              <ChevronLeftIcon />
            </ListItemIcon>
            {props.expanded && (
              <ListItemText
                primary={text}
                primaryTypographyProps={{ className: classes.text }}
              />
            )}
          </ListItem>
        ))}
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

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

export const NavigationSideBar: React.FC<{}> = props => {
  const classes = useStyles();
  const [isOpen, setIsOpen] = React.useState(true);
  const handleDrawerOpen = () => {
    setIsOpen(true);
  };
  const handleDrawerClose = () => {
    console.log("close");
    setIsOpen(false);
  };

  return (
    <Drawer
      open={isOpen}
      variant={"permanent"}
      className={isOpen ? classes.drawerOpen : classes.drawerClose}
      classes={{
        paper: isOpen ? classes.drawerOpen : classes.drawerClose,
      }}
    >
      <Grid
        container
        className={classes.toolbar}
        justify={isOpen ? "space-between" : "center"}
        alignItems="center"
      >
        {isOpen && <Typography variant={"h2"}>Edlumin</Typography>}
        {isOpen ? (
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        ) : (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
        )}
      </Grid>
      <Divider />
      <List>
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
          <ListItem button key={text}>
            <ListItemIcon>
              <ChevronLeftIcon />
            </ListItemIcon>
            {isOpen && <ListItemText primary={text} />}
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
  drawerOpen: {
    width: 240,
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
}));

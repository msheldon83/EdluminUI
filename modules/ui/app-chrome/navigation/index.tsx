import { Drawer, Fab, List, makeStyles } from "@material-ui/core";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import * as React from "react";
import { useCallback } from "react";
import { RedRoverLogo } from "ui/components/red-rover-logo";
import { AutoSwitchingNavLinks } from "../navigation-links/role-nav-links";
import { RoleSwitcher } from "../role-switcher";

type Props = {
  expanded: boolean;
  expand: () => void;
  collapse: () => void;
};

export const NavigationSideBar: React.FC<Props> = props => {
  const classes = useStyles();
  const { expanded, expand, collapse } = props;
  const toggleExpand = useCallback(() => (expanded ? collapse() : expand()), [
    expanded,
    expand,
    collapse,
  ]);

  return (
    <div className={classes.sidebar}>
      <div
        className={`${expanded ? classes.drawerOpen : classes.drawerClose} ${
          classes.fabContainer
        }`}
      >
        <Fab onClick={toggleExpand} size="small" className={classes.fab}>
          {expanded ? (
            <ChevronLeftIcon className={classes.white} />
          ) : (
            <ChevronRightIcon className={classes.white} />
          )}
        </Fab>
      </div>

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
        <RedRoverLogo
          className={props.expanded ? classes.logoLarge : classes.logoSmall}
          size={props.expanded ? "large" : "small"}
        />
        <RoleSwitcher expanded={props.expanded} />
        <List>
          <AutoSwitchingNavLinks navBarExpanded={props.expanded} />
        </List>
      </Drawer>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  sidebar: {
    "@media print": {
      display: "none",
    },
  },
  drawer: {
    background: theme.customColors.edluminSlate,
    borderRightWidth: 0,
    flexShrink: 0,
  },
  drawerOpen: {
    width: theme.typography.pxToRem(258),
    overflowX: "hidden",
    willChange: "width",
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
      width: theme.typography.pxToRem(53),
    },
  },
  logoLarge: {
    marginBottom: theme.spacing(1.5),
    marginLeft: theme.spacing(0.5),
    transition: theme.transitions.create("margin-left", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
  },
  logoSmall: {
    marginBottom: theme.spacing(1.5),
    marginLeft: 0,
  },
  spacing: {
    marginLeft: theme.typography.pxToRem(23),
  },
  icon: {
    color: theme.customColors.medLightGray,
    marginLeft: theme.typography.pxToRem(24),
  },
  margin: {
    marginLeft: theme.typography.pxToRem(3),
  },

  fabContainer: {
    overflow: "visible",
    position: "relative",
    zIndex: 2000,
  },
  fab: {
    position: "absolute",
    top: theme.typography.pxToRem(-20),
    right: theme.typography.pxToRem(-20),
    backgroundColor: theme.customColors.edluminSlate,
    "&:hover": {
      backgroundColor: theme.customColors.edluminSlate,
      border: `${theme.typography.pxToRem(1)} solid ${
        theme.customColors.white
      }`,
    },
  },
  white: {
    color: theme.customColors.white,
  },
}));

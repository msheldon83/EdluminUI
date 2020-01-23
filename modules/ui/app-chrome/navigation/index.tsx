import { Divider, Drawer, List, makeStyles } from "@material-ui/core";
import * as React from "react";
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

  return (
    <div className={classes.sidebar}>
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
        <RedRoverLogo showSmallLogo={!props.expanded} />

        <RoleSwitcher expanded={props.expanded} />
        <Divider className={classes.divider} />
        <List className={classes.list}>
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
    flexShrink: 0,
  },
  drawerOpen: {
    width: theme.typography.pxToRem(258),
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
  },
  divider: {
    background: theme.customColors.edluminLightSlate,
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
    marginLeft: theme.typography.pxToRem(23),
  },
  icon: {
    color: theme.customColors.medLightGray,
    marginLeft: theme.typography.pxToRem(24),
  },
  margin: {
    marginLeft: theme.typography.pxToRem(3),
  },
}));

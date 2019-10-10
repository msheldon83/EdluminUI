import { makeStyles, DefaultTheme } from "@material-ui/styles";
import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { NavigationSideBar } from "ui/app-chrome/navigation";
import { Menu, Fab } from "@material-ui/core";
import { useBreakpoint, useScreenSize } from "hooks";
import { MobileTopBar } from "./mobile-top-bar";
import { MobileNavigationSideBar } from "./mobile-navigation-side-bar";
import { TopBar } from "./top-bar";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";

export const AppChrome: React.FunctionComponent = props => {
  const screenSize = useScreenSize();
  const [expanded, setExpanded] = useState(screenSize === "large");
  useEffect(() => {
    setExpanded(screenSize === "large");
  }, [screenSize]);
  const mobile = screenSize === "mobile";
  const expand = useCallback(() => setExpanded(true), [setExpanded]);
  const collapse = useCallback(() => setExpanded(false), [setExpanded]);
  const toggleExpand = useCallback(() => setExpanded(v => !v), [setExpanded]);
  const classes = useStyles();

  /* cf - 2019-10-09
      it's important that both mobile and not mobile return the same number of items
      in the fragment, and that the final item is a <div> containing children.

      otherwise, react's dom diffing will end up throwing all the state of children away
      and re-render from scratch, which could cause graphql queries to be re-run and
      other strange things.
      */
  if (mobile) {
    return (
      <>
        <MobileTopBar expandDrawer={expand} />
        <MobileNavigationSideBar expanded={expanded} collapse={collapse} />
        <div>{props.children}</div>
      </>
    );
  } else {
    return (
      <>
        <TopBar
          className={
            expanded ? classes.leftPaddingExpanded : classes.leftPaddingCompact
          }
        />
        <NavigationSideBar
          drawerStyle={screenSize === "mobile" ? "temporary" : "permanent"}
          expanded={expanded}
          expand={expand}
          collapse={collapse}
        />
        <div
          className={`${
            expanded ? classes.leftMarginExpanded : classes.leftMarginCompact
          } ${classes.navBarSpacer}`}
        >
          {props.children}
        </div>
        <Fab
          onClick={toggleExpand}
          size="small"
          className={`${
            expanded ? classes.leftMarginExpanded : classes.leftMarginCompact
          } ${classes.fab}`}
        >
          {expanded ? (
            <ChevronLeftIcon className={classes.white} />
          ) : (
            <ChevronRightIcon className={classes.white} />
          )}
        </Fab>
      </>
    );
  }
};

const useStyles = makeStyles(theme => ({
  name: {
    backgroundColor: theme.customColors.mustard,
    padding: theme.typography.pxToRem(24),
    marginTop: theme.typography.pxToRem(18),
  },
  leftPaddingExpanded: {
    paddingLeft: theme.typography.pxToRem(240),
    transition: theme.transitions.create("padding", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
  },
  leftPaddingCompact: {
    paddingLeft: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(9) + 1,
    },
    transition: theme.transitions.create("padding", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
  },
  navBarSpacer: {
    position: "absolute",
    width: "100%",
  },
  leftMarginCompact: {
    marginLeft: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(9) + 1,
    },
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
  },
  leftMarginExpanded: {
    marginLeft: theme.typography.pxToRem(240),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
  },
  fab: {
    backgroundColor: theme.customColors.edluminSlate,
    position: "absolute",
    left: "-20px",
    top: theme.typography.pxToRem(45),
    zIndex: 4000,
  },
  white: {
    color: theme.customColors.white,
  },
}));

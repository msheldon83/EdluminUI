import { Fab } from "@material-ui/core";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { makeStyles } from "@material-ui/styles";
import { not } from "helpers";
import { useScreenSize } from "hooks";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { NavigationSideBar } from "ui/app-chrome/navigation";
import { LoadingStateProvider } from "ui/components/loading-state";
import { MobileNavigationSideBar } from "./mobile-navigation/mobile-navigation-side-bar";
import { MobileTopBar } from "./mobile-navigation/mobile-top-bar";
import { TopBar } from "./navigation/top-bar";
import { LoadingStateIndicatorFullScreen } from "ui/components/loading-state/loading-state-indicator-fullscreen";

export const AppChrome: React.FunctionComponent = props => {
  const screenSize = useScreenSize();
  const [expanded, setExpanded] = useState(screenSize === "large");
  useEffect(() => {
    setExpanded(screenSize === "large");
  }, [screenSize]);
  const mobile = screenSize === "mobile";
  const expand = useCallback(() => setExpanded(true), [setExpanded]);
  const collapse = useCallback(() => setExpanded(false), [setExpanded]);
  const toggleExpand = useCallback(() => setExpanded(not), [setExpanded]);
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
      <LoadingStateProvider>
        <MobileTopBar expandDrawer={expand} />
        <MobileNavigationSideBar expanded={expanded} collapse={collapse} />
        <div>
          <div />
          <div className={classes.contentView}>
            <LoadingStateIndicatorFullScreen>
              {props.children}
            </LoadingStateIndicatorFullScreen>
          </div>
        </div>
      </LoadingStateProvider>
    );
  } else {
    return (
      <LoadingStateProvider>
        <TopBar
          contentClassName={
            expanded ? classes.leftPaddingExpanded : classes.leftPaddingCompact
          }
        />
        <NavigationSideBar
          expanded={expanded}
          expand={expand}
          collapse={collapse}
        />
        <div className={`${classes.container}`}>
          <div
            className={`${
              expanded ? classes.navWidthExpanded : classes.navWidthCompact
            }`}
          >
            <div className={classes.fabContainer}>
              <Fab onClick={toggleExpand} size="small" className={classes.fab}>
                {expanded ? (
                  <ChevronLeftIcon className={classes.white} />
                ) : (
                  <ChevronRightIcon className={classes.white} />
                )}
              </Fab>
            </div>
          </div>
          <div className={`${classes.contentView}`}>
            <LoadingStateIndicatorFullScreen>
              {props.children}
            </LoadingStateIndicatorFullScreen>
          </div>
        </div>
      </LoadingStateProvider>
    );
  }
};

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexDirection: "row",
  },
  navWidthExpanded: {
    width: theme.typography.pxToRem(258),
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
  },
  navWidthCompact: {
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
  },
  contentView: {
    flexGrow: 1,
    padding: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
    },
  },
  name: {
    backgroundColor: theme.customColors.mustard,
    padding: theme.typography.pxToRem(24),
    marginTop: theme.typography.pxToRem(18),
  },
  leftPaddingExpanded: {
    paddingLeft: theme.typography.pxToRem(258),
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
  fabContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  fab: {
    backgroundColor: theme.customColors.edluminSlate,
    position: "absolute",
    top: theme.typography.pxToRem(-20),
    right: theme.typography.pxToRem(-20),
    zIndex: 4000,
  },
  white: {
    color: theme.customColors.white,
  },
}));

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
import { PageTitleProvider } from "./page-title-context";
import { ErrorBoundary } from "ui/components/error-boundary";
import { OrganizationSwitcherBar } from "./organization-switcher-bar";
import { Route } from "react-router";
import { AdminChromeRoute } from "ui/routes/app-chrome";
import { SnackbarProvider } from "hooks/use-snackbar";
import { DialogProvider } from "hooks/use-dialog";

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
        <PageTitleProvider>
          <Route path={AdminChromeRoute.path}>
            <OrganizationSwitcherBar />
          </Route>
          <div className={classes.outer}>
            <MobileTopBar expandDrawer={expand} />
            <MobileNavigationSideBar expanded={expanded} collapse={collapse} />
            <div className={classes.mainContent}>
              <SnackbarProvider>
                <DialogProvider>
                  <div />
                  <div className={classes.contentView}>
                    <ErrorBoundary>
                      <LoadingStateIndicatorFullScreen>
                        {props.children}
                      </LoadingStateIndicatorFullScreen>
                    </ErrorBoundary>
                  </div>
                </DialogProvider>
              </SnackbarProvider>
            </div>
          </div>
        </PageTitleProvider>
      </LoadingStateProvider>
    );
  } else {
    return (
      <LoadingStateProvider>
        <PageTitleProvider>
          <Route path={AdminChromeRoute.path}>
            <OrganizationSwitcherBar
            // contentClassName={
            //   expanded
            //     ? classes.leftPaddingExpanded
            //     : classes.leftPaddingCompact
            // }
            />
          </Route>
          <div className={classes.outer}>
            <TopBar
              contentClassName={
                expanded
                  ? classes.leftPaddingExpanded
                  : classes.leftPaddingCompact
              }
            />
            <NavigationSideBar
              expanded={expanded}
              expand={expand}
              collapse={collapse}
            />
            <div className={`${classes.container}`}>
              <SnackbarProvider>
                <DialogProvider>
                  <div
                    className={`${
                      expanded
                        ? classes.navWidthExpanded
                        : classes.navWidthCompact
                    }`}
                  >
                    <div className={classes.fabContainer}>
                      <Fab
                        onClick={toggleExpand}
                        size="small"
                        className={classes.fab}
                      >
                        {expanded ? (
                          <ChevronLeftIcon className={classes.white} />
                        ) : (
                          <ChevronRightIcon className={classes.white} />
                        )}
                      </Fab>
                    </div>
                  </div>
                  <div className={`${classes.contentView}`}>
                    <ErrorBoundary>
                      <LoadingStateIndicatorFullScreen>
                        {props.children}
                      </LoadingStateIndicatorFullScreen>
                    </ErrorBoundary>
                  </div>
                </DialogProvider>
              </SnackbarProvider>
            </div>
          </div>
        </PageTitleProvider>
      </LoadingStateProvider>
    );
  }
};

const useStyles = makeStyles(theme => ({
  outer: {
    display: "flex",
    maxWidth: "100%",
    flexDirection: "column",
    minHeight: "100%",
    flexGrow: 1,
  },
  mainContent: { flexGrow: 1 },
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    flexGrow: 1,
    maxWidth: theme.typography.pxToRem(1440),
  },

  navWidthExpanded: {
    flexShrink: 0,
    width: theme.typography.pxToRem(258),
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
    "@media print": {
      display: "none",
    },
  },
  navWidthCompact: {
    flexShrink: 0,
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
    "@media print": {
      display: "none",
    },
  },
  contentView: {
    [theme.breakpoints.up("md")]: {
      width: "1px", // Prevent the content view from expanding past its allowed size
    },
    flexGrow: 1,
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0),
      paddingTop: theme.spacing(2),
    },
    "@media print": {
      padding: 0,
      fontSize: theme.typography.pxToRem(11),
    },
  },
  name: {
    backgroundColor: theme.customColors.mustard,
    padding: theme.typography.pxToRem(24),
    marginTop: theme.typography.pxToRem(18),
  },
  leftPaddingExpanded: {
    maxWidth: theme.typography.pxToRem(1440),
    paddingLeft: theme.typography.pxToRem(258),
    transition: theme.transitions.create("padding", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
  },
  leftPaddingCompact: {
    maxWidth: theme.typography.pxToRem(1440),
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

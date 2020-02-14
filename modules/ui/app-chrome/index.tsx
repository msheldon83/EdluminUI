import { makeStyles } from "@material-ui/styles";
import { useScreenSize } from "hooks";
import { DialogProvider } from "hooks/use-dialog";
import { SnackbarProvider } from "hooks/use-snackbar";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { Route } from "react-router";
import { NavigationSideBar } from "ui/app-chrome/navigation";
import { ErrorBoundary } from "ui/components/error-boundary";
import { LoadingStateProvider } from "ui/components/loading-state";
import { LoadingStateIndicatorFullScreen } from "ui/components/loading-state/loading-state-indicator-fullscreen";
import { AdminChromeRoute } from "ui/routes/app-chrome";
import { MobileNavigationSideBar } from "./mobile-navigation/mobile-navigation-side-bar";
import { MobileTopBar } from "./mobile-navigation/mobile-top-bar";
import { TopBar } from "./navigation/top-bar";
import { OrganizationSwitcherBar } from "./organization-switcher-bar";
import { PageTitleProvider } from "./page-title-context";
import { OrganizationStatusBar } from "./orgaization-status-bar";
import { HelpWidget } from "./help-widget";

export const AppChrome: React.FunctionComponent = props => {
  const screenSize = useScreenSize();
  const [expanded, setExpanded] = useState(screenSize === "large");
  useEffect(() => {
    setExpanded(screenSize === "large");
  }, [screenSize]);
  const mobile = screenSize === "mobile";
  const expand = useCallback(() => setExpanded(true), [setExpanded]);
  const collapse = useCallback(() => setExpanded(false), [setExpanded]);
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
          <div className={classes.app}>
            <Route path={AdminChromeRoute.path}>
              <OrganizationSwitcherBar />
            </Route>
            <Route path={AdminChromeRoute.path}>
              <OrganizationStatusBar />
            </Route>
            <div className={classes.outer}>
              <MobileTopBar expandDrawer={expand} />
              <MobileNavigationSideBar
                expanded={expanded}
                collapse={collapse}
              />
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
            <HelpWidget />
          </div>
        </PageTitleProvider>
      </LoadingStateProvider>
    );
  } else {
    return (
      <LoadingStateProvider>
        <PageTitleProvider>
          <div className={classes.app}>
            <Route path={AdminChromeRoute.path}>
              <OrganizationSwitcherBar />
            </Route>
            <Route path={AdminChromeRoute.path}>
              <OrganizationStatusBar />
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
                    ></div>
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
            <HelpWidget />
          </div>
        </PageTitleProvider>
      </LoadingStateProvider>
    );
  }
};

const useStyles = makeStyles(theme => ({
  app: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  outer: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    overflow: "hidden",
    transform:
      "rotate(0)" /* cf - this affects how position works in children elements. */,
  },
  mainContent: {
    flexGrow: 1,
    overflowY: "auto",
  },
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    flexGrow: 1,
    maxWidth: theme.typography.pxToRem(1440),
    transform: "rotate(0)",
    overflowY: "auto",
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
    overflowY: "auto",
    [theme.breakpoints.up("md")]: {
      width: "1px", // Prevent the content view from expanding past its allowed size
    },
    flexGrow: 1,
    marginTop: theme.spacing(3),
    padding: theme.spacing(0, 3, 4, 3),
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
}));

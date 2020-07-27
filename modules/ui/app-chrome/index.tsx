import { makeStyles } from "@material-ui/styles";
import clsx from "clsx";
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
import { OrganizationStatusBar } from "./organization-status-bar";
import { HelpWidget } from "./help-widget";
import { contentFooterRef } from "../components/content-footer";
import { useAppConfig } from "../../hooks/app-config";
import { ImpersonationStatusBar } from "./impersonation-status-bar";

export const AppChrome: React.FunctionComponent = props => {
  const screenSize = useScreenSize();
  const [expanded, setExpanded] = useState(screenSize === "large");
  useEffect(() => {
    setExpanded(screenSize === "large");
  }, [screenSize]);
  const mobile = screenSize === "mobile";
  const expand = useCallback(() => setExpanded(true), [setExpanded]);
  const collapse = useCallback(() => setExpanded(false), [setExpanded]);
  const classes = useStyles({ expanded: expand });
  const { appConfig } = useAppConfig();

  const contentFooterClasses = clsx({
    [classes.contentFooterContainer]: true,
    [classes.contentFooterContainerExpanded]: expanded,
    [classes.contentFooterContainerCompact]: !expanded,
  });

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
        <LoadingStateProvider>
          <PageTitleProvider>
            <div className={classes.app}>
              <Route path={AdminChromeRoute.path}>
                <OrganizationSwitcherBar />
              </Route>
              <Route path={AdminChromeRoute.path}>
                <OrganizationStatusBar />
              </Route>
              <ImpersonationStatusBar />
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
                      <div
                        className={classes.mobileContentView}
                        style={{ maxWidth: appConfig.contentWidth }}
                      >
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
              <div className={contentFooterClasses}>
                <div className={classes.contentFooter} ref={contentFooterRef} />
              </div>
            </div>
          </PageTitleProvider>
        </LoadingStateProvider>
        <HelpWidget />
      </>
    );
  } else {
    return (
      <>
        <LoadingStateProvider>
          <PageTitleProvider>
            <div className={classes.app}>
              <Route path={AdminChromeRoute.path}>
                <OrganizationSwitcherBar />
              </Route>
              <Route path={AdminChromeRoute.path}>
                <OrganizationStatusBar />
              </Route>
              <ImpersonationStatusBar />
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
                <div id="main-container" className={classes.container}>
                  <SnackbarProvider>
                    <DialogProvider>
                      <div
                        className={`${
                          expanded
                            ? classes.navWidthExpanded
                            : classes.navWidthCompact
                        }`}
                      ></div>
                      <div
                        className={classes.contentView}
                        style={{ maxWidth: appConfig.contentWidth }}
                      >
                        <ErrorBoundary>
                          <LoadingStateIndicatorFullScreen>
                            {props.children}
                          </LoadingStateIndicatorFullScreen>
                        </ErrorBoundary>
                      </div>
                    </DialogProvider>
                  </SnackbarProvider>
                </div>
                <div className={contentFooterClasses}>
                  <div
                    className={classes.contentFooter}
                    ref={contentFooterRef}
                  />
                </div>
              </div>
            </div>
          </PageTitleProvider>
        </LoadingStateProvider>
        <HelpWidget />
      </>
    );
  }
};

const useStyles = makeStyles(theme => ({
  app: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    "@media print": {
      height: "100%",
    },
  },
  outer: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    overflow: "hidden",
    transform:
      "rotate(0)" /* cf - this affects how position works in children elements. */,
  },

  containerWrapper: {
    display: "flex",
    overflow: "hidden",
  },
  containerStacker: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    height: "100%",
  },
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    flexGrow: 1,
    overflow: "auto",
    transform: "rotate(0)",
    "@media print": {
      height: "100%",
      overflowY: "hidden",
    },
  },
  mainContent: {
    display: "flex",
    flexGrow: 1,
    overflowY: "auto",
  },

  contentFooterContainer: {
    boxSizing: "border-box",
    backgroundColor: "#E3F2FD",
    border: "1px solid #d8d8d8",
    transition: theme.transitions.create("padding", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
  },
  contentFooterContainerExpanded: {
    paddingLeft: theme.customSpacing.navBarWidthExpanded,
  },
  contentFooterContainerCompact: {
    paddingLeft: theme.customSpacing.navBarWidthCompact,
  },
  contentFooter: {
    width: "100%",
  },

  navWidthExpanded: {
    flexShrink: 0,
    width: theme.customSpacing.navBarWidthExpanded,
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
    width: theme.customSpacing.navBarWidthCompact,

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
    flexGrow: 1,
    marginTop: theme.spacing(3),
    padding: theme.spacing(0, 3, 4, 3),
    "@media print": {
      padding: 0,
      fontSize: theme.typography.pxToRem(11),
      overflowY: "hidden",
    },
  },

  mobileContentView: {
    flexGrow: 1,
    marginTop: theme.spacing(3),
    "@media print": {
      padding: 0,
      fontSize: theme.typography.pxToRem(11),
      overflowY: "hidden",
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

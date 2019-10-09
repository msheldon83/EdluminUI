import { makeStyles, DefaultTheme } from "@material-ui/styles";
import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { NavigationSideBar } from "ui/app-chrome/navigation";
import { Menu } from "@material-ui/core";
import { useBreakpoint, useScreenSize } from "hooks";
import { MobileTopBar } from "./mobile-top-bar";
import { MobileNavigationSideBar } from "./mobile-navigation-side-bar";
import { TopBar } from "./top-bar";

export const AppChrome: React.FunctionComponent = props => {
  const screenSize = useScreenSize();
  const [expanded, setExpanded] = useState(screenSize === "large");
  useEffect(() => {
    setExpanded(screenSize === "large");
  }, [screenSize]);
  const mobile = screenSize === "mobile";
  const expand = useCallback(() => setExpanded(true), [setExpanded]);
  const collapse = useCallback(() => setExpanded(false), [setExpanded]);
  const classes = useStyles({
    mobile: screenSize === "mobile",
    expanded: expanded,
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
        <MobileTopBar expandDrawer={expand} />
        <MobileNavigationSideBar expanded={expanded} collapse={collapse} />
        <div>{props.children}</div>
      </>
    );
  } else {
    return (
      <>
        <TopBar />
        <NavigationSideBar
          drawerStyle={screenSize === "mobile" ? "temporary" : "permanent"}
          expanded={expanded}
          expand={expand}
          collapse={collapse}
        />
        <div className={classes.navSpacer}>{props.children}</div>
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
  navSpacer: (props: { mobile: boolean; expanded: boolean }) => {
    return {
      paddingLeft: theme.typography.pxToRem(
        navBarWidth(props.mobile, props.expanded)
      ),
    };
  },
}));

const navBarWidth = (mobile: boolean, expanded: boolean): number => {
  const fullWidth = 240;
  const smallWidth = 50;
  if (mobile && !expanded) return 0;
  if (!mobile && !expanded) return smallWidth;
  return fullWidth;
};

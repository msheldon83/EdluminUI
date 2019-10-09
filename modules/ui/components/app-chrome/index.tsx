import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { NavigationSideBar } from "ui/components/app-chrome/navigation";
import { Menu } from "@material-ui/core";
import { useBreakpoint, useScreenSize } from "hooks";
import { MobileTopBar } from "./mobile-top-bar";

export const AppChrome: React.FunctionComponent = props => {
  const classes = useStyles();
  const screenSize = useScreenSize();
  const [expanded, setExpanded] = useState(screenSize === "large");
  useEffect(() => {
    setExpanded(screenSize === "large");
  }, [screenSize]);
  const showTopBar = screenSize === "mobile";
  const expand = useCallback(() => setExpanded(true), [setExpanded]);
  const collapse = useCallback(() => setExpanded(false), [setExpanded]);

  return (
    <>
      {showTopBar && (
        <>
          <MobileTopBar expandDrawer={expand} />
        </>
      )}
      <NavigationSideBar
        drawerStyle={screenSize === "mobile" ? "temporary" : "permanent"}
        expanded={expanded}
        expand={expand}
        collapse={collapse}
      />
      {props.children}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  name: {
    backgroundColor: theme.customColors.mustard,
    padding: theme.typography.pxToRem(24),
    marginTop: theme.typography.pxToRem(18),
  },
}));

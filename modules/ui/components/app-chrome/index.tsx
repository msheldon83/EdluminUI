import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { NavigationSideBar } from "ui/components/app-chrome/navigation";
import { useMediaQuery, Menu } from "@material-ui/core";
import { EdluminTheme } from "ui/styles/mui-theme";

export const AppChrome: React.FunctionComponent = props => {
  const classes = useStyles();
  const isXsDown = useMediaQuery(EdluminTheme.breakpoints.down("xs"));

  return (
    <>
      {/* {isXsDown ? <NavigationSideBar /> : <Menu />} */}
      <NavigationSideBar />
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

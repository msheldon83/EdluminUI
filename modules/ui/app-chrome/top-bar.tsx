import * as React from "react";
import { AppBar, Toolbar, IconButton, makeStyles } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";

type Props = {};
export const TopBar: React.FC<Props> = props => {
  const iconButtonClasses = useIconButtonClasses();
  const mobileToolbarClasses = useMobileToolbarClasses();
  return (
    <>
      <AppBar position="fixed">
        <Toolbar classes={mobileToolbarClasses}>
          {/* <IconButton
            edge="start"
            classes={iconButtonClasses}
            onClick={props.expandDrawer}
          >
            <MenuIcon />
          </IconButton> */}
        </Toolbar>
      </AppBar>
      <Toolbar>{/* This is here to make space for the app bar */}</Toolbar>
    </>
  );
};

const useMobileToolbarClasses = makeStyles(theme => ({
  root: {
    background: theme.customColors.white,
  },
}));

const useIconButtonClasses = makeStyles(theme => ({
  label: {
    color: theme.customColors.white,
  },
}));

import * as React from "react";
import { AppBar, Toolbar, IconButton, makeStyles } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { LoadingStateIndicator } from "ui/components/loading-state/loading-state-indicator";

type Props = { expandDrawer: () => void };
export const MobileTopBar: React.FC<Props> = props => {
  const iconButtonClasses = useIconButtonClasses();
  const mobileToolbarClasses = useMobileToolbarClasses();
  return (
    <>
      <AppBar position="fixed">
        <LoadingStateIndicator />
        <Toolbar classes={mobileToolbarClasses}>
          <IconButton
            edge="start"
            classes={iconButtonClasses}
            onClick={props.expandDrawer}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Toolbar>{/* This is here to make space for the app bar */}</Toolbar>
    </>
  );
};

const useMobileToolbarClasses = makeStyles(theme => ({
  root: {
    background: theme.customColors.edluminSlate,
  },
}));

const useIconButtonClasses = makeStyles(theme => ({
  label: {
    color: theme.customColors.white,
  },
}));
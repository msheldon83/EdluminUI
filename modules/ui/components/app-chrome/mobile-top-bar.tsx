import * as React from "react";
import { AppBar, Toolbar, IconButton, makeStyles } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";

type Props = { expandDrawer: () => void };
export const MobileTopBar: React.FC<Props> = props => {
  const iconButtonClasses = useIconButtonClasses();
  const mobileToolbarClasses = useMobileToolbarClasses();
  return (
    <AppBar position="static">
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

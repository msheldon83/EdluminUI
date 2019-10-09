import * as React from "react";
import { AppBar, Toolbar, IconButton, makeStyles } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";

type Props = { className?: string };
export const TopBar: React.FC<Props> = props => {
  const iconButtonClasses = useIconButtonClasses();
  const mobileToolbarClasses = useMobileToolbarClasses();
  return (
    <>
      <AppBar position="fixed" className={props.className}>
        <Toolbar classes={mobileToolbarClasses}>
          <IconButton
            edge="start"
            classes={iconButtonClasses}
            // onClick={props.expandDrawer}
          >
            <SearchIcon />
          </IconButton>
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
    color: theme.customColors.black,
  },
}));

import { AppBar, IconButton, makeStyles, Toolbar } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import * as React from "react";
import { LoadingStateIndicator } from "ui/components/loading-state/loading-state-indicator";

type Props = { contentClassName?: string };
export const TopBar: React.FC<Props> = props => {
  const iconButtonClasses = useIconButtonClasses();
  const mobileToolbarClasses = useMobileToolbarClasses();
  return (
    <>
      <AppBar position="fixed">
        <LoadingStateIndicator />
        <div className={props.contentClassName}>
          <Toolbar classes={mobileToolbarClasses}>
            <IconButton
              edge="start"
              classes={iconButtonClasses}
              // onClick={props.expandDrawer}
            >
              <SearchIcon />
            </IconButton>
          </Toolbar>
        </div>
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

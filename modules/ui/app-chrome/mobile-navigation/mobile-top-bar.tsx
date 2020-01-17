import * as React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { LoadingStateIndicator } from "ui/components/loading-state/loading-state-indicator";
import { usePageTitleContext } from "../page-title-context";

type Props = { expandDrawer: () => void };
export const MobileTopBar: React.FC<Props> = props => {
  const iconButtonClasses = useIconButtonStyles();
  const mobileToolbarClasses = useMobileToolbarStyles();
  const classes = useStyles();
  const pageTitleContext = usePageTitleContext();
  return (
    <>
      <AppBar position="sticky" className={classes.mobileAppBar}>
        <LoadingStateIndicator />
        <Toolbar classes={mobileToolbarClasses}>
          <IconButton
            edge="start"
            classes={iconButtonClasses}
            onClick={props.expandDrawer}
          >
            <MenuIcon />
          </IconButton>
          {pageTitleContext.showIn === "menu-bar" && (
            <Typography className={classes.pageTitle}>
              {pageTitleContext.title}
            </Typography>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
};

const useMobileToolbarStyles = makeStyles(theme => ({
  root: {
    background: theme.customColors.edluminSlate,
  },
}));

const useIconButtonStyles = makeStyles(theme => ({
  label: {
    color: theme.customColors.white,
  },
}));

const useStyles = makeStyles(theme => ({
  mobileAppBar: {
    "@media print": { display: "none" },
  },
  pageTitle: {
    color: theme.customColors.white,
    fontSize: theme.typography.pxToRem(20),
    fontWeight: 500,
  },
}));

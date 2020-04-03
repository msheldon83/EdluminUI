import {
  AppBar,
  Grid,
  IconButton,
  makeStyles,
  Toolbar,
} from "@material-ui/core";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import NotificationsNoneIcon from "@material-ui/icons/NotificationsNone";
import * as React from "react";
import { Route } from "react-router-dom";
import { QuickCreateButton } from "ui/components/absence/quick-create-button";
import { LoadingStateIndicator } from "ui/components/loading-state/loading-state-indicator";
import { ProfileAvatar } from "ui/components/profile-avatar/profile-avatar";
import { AdminChromeRoute, AppChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";
import { SearchBar } from "./search-bar";
import { HelpMenu } from "./help-menu";
import { UserMenu } from "./user-menu";
import { useAppConfig, AppConfig } from "hooks/app-config";

type Props = { contentClassName?: string };

export const TopBar: React.FC<Props> = props => {
  const classes = useStyles();
  const iconButtonClasses = useIconButtonClasses();
  const { appConfig } = useAppConfig();
  const mobileToolbarClasses = useMobileToolbarClasses(appConfig);
  const params = useRouteParams(AppChromeRoute);

  const [
    subUserMenuAnchor,
    setUserSubMenuAnchor,
  ] = React.useState<null | HTMLElement>(null);

  const [
    subHelpMenuAnchor,
    setHelpSubMenuAnchor,
  ] = React.useState<null | HTMLElement>(null);

  return (
    <>
      <AppBar position="sticky" elevation={0} className={classes.appBar}>
        <LoadingStateIndicator />
        <div className={props.contentClassName}>
          <Toolbar classes={mobileToolbarClasses}>
            <Grid container justify="space-between" alignItems="center">
              <Grid item>
                <SearchBar />
              </Grid>

              <Grid item>
                {params.role === "admin" ? (
                  <Route path={AdminChromeRoute.path}>
                    <QuickCreateButton role={params.role} />
                  </Route>
                ) : (
                  <QuickCreateButton role={params.role} />
                )}
                <IconButton edge="end" classes={iconButtonClasses}>
                  <NotificationsNoneIcon />
                </IconButton>
                <IconButton
                  aria-haspopup="true"
                  aria-owns="help-menu"
                  edge="end"
                  classes={iconButtonClasses}
                  onClick={event => setHelpSubMenuAnchor(event.currentTarget)}
                >
                  <HelpOutlineIcon />
                </IconButton>
                <HelpMenu
                  anchorElement={subHelpMenuAnchor}
                  open={Boolean(subHelpMenuAnchor)}
                  onClose={() => setHelpSubMenuAnchor(null)}
                />
                <IconButton
                  aria-haspopup="true"
                  aria-owns="user-menu"
                  edge="end"
                  classes={iconButtonClasses}
                  onClick={event => setUserSubMenuAnchor(event.currentTarget)}
                >
                  <ProfileAvatar className={classes.avatar} />
                </IconButton>
                <UserMenu
                  anchorElement={subUserMenuAnchor}
                  open={Boolean(subUserMenuAnchor)}
                  onClose={() => setUserSubMenuAnchor(null)}
                />
              </Grid>
            </Grid>
          </Toolbar>
        </div>
      </AppBar>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  avatar: {
    backgroundColor: theme.customColors.eduBlue,
    color: theme.customColors.white,
  },
  appBar: {
    borderBottom: `1px solid ${theme.customColors.sectionBorder}`,
    backgroundColor: theme.customColors.white,
    "@media print": {
      display: "none",
    },
  },
}));

const useMobileToolbarClasses = makeStyles<any, AppConfig>(theme => ({
  root: {
    background: theme.customColors.white,
    boxSizing: "border-box",
    paddingLeft: 0,
    maxWidth: props => props.contentWidth,
    paddingRight: theme.spacing(3),
  },
}));

const useIconButtonClasses = makeStyles(theme => ({
  label: {
    color: theme.customColors.black,
  },
  root: {
    marginLeft: theme.spacing(1),
  },
}));

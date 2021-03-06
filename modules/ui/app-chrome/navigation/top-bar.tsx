import {
  AppBar,
  Grid,
  IconButton,
  makeStyles,
  Toolbar,
} from "@material-ui/core";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
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
import { NotificationsUI } from "../notifications";
import { NotificationIcon } from "../notifications/components/notifications-icon";

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

  const [
    subNotificationsAnchor,
    setSubNotificationsAnchor,
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
                <IconButton
                  aria-describedby="notifications-popover"
                  edge="end"
                  classes={iconButtonClasses}
                  onClick={event => {
                    setSubNotificationsAnchor(event.currentTarget);
                  }}
                >
                  <NotificationIcon />
                </IconButton>
                <NotificationsUI
                  open={Boolean(subNotificationsAnchor)}
                  anchorElement={subNotificationsAnchor}
                  onClose={() => setSubNotificationsAnchor(null)}
                />
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

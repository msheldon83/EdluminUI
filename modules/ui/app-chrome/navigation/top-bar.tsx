import {
  AppBar,
  Grid,
  IconButton,
  makeStyles,
  Toolbar,
} from "@material-ui/core";
import NotificationsNoneIcon from "@material-ui/icons/NotificationsNone";
import * as React from "react";
import { Route } from "react-router-dom";
import { LoadingStateIndicator } from "ui/components/loading-state/loading-state-indicator";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";
import { ProfileAvatar } from "ui/components/profile-avatar/profile-avatar";
import { QuickCreateButton } from "ui/components/absence/quick-create-button";
import { AppChromeRoute, AdminChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";

type Props = { contentClassName?: string };

export const TopBar: React.FC<Props> = props => {
  const classes = useStyles();
  const iconButtonClasses = useIconButtonClasses();
  const [subMenuAnchor, setSubMenuAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const mobileToolbarClasses = useMobileToolbarClasses();
  const params = useRouteParams(AppChromeRoute);

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
                  aria-owns="user-menu"
                  edge="end"
                  classes={iconButtonClasses}
                  onClick={event => setSubMenuAnchor(event.currentTarget)}
                >
                  <ProfileAvatar className={classes.avatar} />
                </IconButton>
                <UserMenu
                  anchorElement={subMenuAnchor}
                  open={Boolean(subMenuAnchor)}
                  onClose={() => setSubMenuAnchor(null)}
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

const useMobileToolbarClasses = makeStyles(theme => ({
  root: {
    background: theme.customColors.white,
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

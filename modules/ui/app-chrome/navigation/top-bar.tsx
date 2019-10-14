import {
  AppBar,
  Grid,
  IconButton,
  makeStyles,
  Toolbar,
} from "@material-ui/core";
import AddToPhotosIcon from "@material-ui/icons/AddToPhotos";
import NotificationsNoneIcon from "@material-ui/icons/NotificationsNone";
import SearchIcon from "@material-ui/icons/Search";
import * as React from "react";
import { LoadingStateIndicator } from "ui/components/loading-state/loading-state-indicator";
import { ProfileAvatar } from "../profile-avatar";
import { ProfileSubMenu } from "./profile-submenu";

type Props = { contentClassName?: string };
export const TopBar: React.FC<Props> = props => {
  const iconButtonClasses = useIconButtonClasses();
  const [subMenuAnchor, setSubMenuAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const mobileToolbarClasses = useMobileToolbarClasses();
  return (
    <>
      <AppBar position="fixed">
        <LoadingStateIndicator />
        <div className={props.contentClassName}>
          <Toolbar classes={mobileToolbarClasses}>
            <Grid container justify="space-between" alignItems="center">
              <Grid item>
                <IconButton edge="start" classes={iconButtonClasses}>
                  <SearchIcon />
                </IconButton>
              </Grid>

              <Grid item>
                <IconButton edge="end" classes={iconButtonClasses}>
                  <AddToPhotosIcon />
                </IconButton>

                <IconButton edge="end" classes={iconButtonClasses}>
                  <NotificationsNoneIcon />
                </IconButton>

                <IconButton
                  aria-haspopup="true"
                  aria-owns="profileMenu"
                  edge="end"
                  classes={iconButtonClasses}
                  onClick={event => {
                    console.log(event.currentTarget);
                    setSubMenuAnchor(event.currentTarget);
                  }}
                >
                  <ProfileAvatar
                    initials={"ZZ"}
                    className={mobileToolbarClasses.avatar}
                  />
                </IconButton>
                <ProfileSubMenu
                  anchorElement={subMenuAnchor}
                  open={Boolean(subMenuAnchor)}
                  onClose={() => setSubMenuAnchor(null)}
                />
              </Grid>
            </Grid>
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
  avatar: {
    backgroundColor: theme.customColors.eduBlue,
    color: theme.customColors.white,
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

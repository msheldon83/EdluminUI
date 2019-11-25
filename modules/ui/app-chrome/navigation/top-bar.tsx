import {
  AppBar,
  Grid,
  IconButton,
  makeStyles,
  Toolbar,
} from "@material-ui/core";
import AddToPhotosIcon from "@material-ui/icons/AddToPhotos";
import NotificationsNoneIcon from "@material-ui/icons/NotificationsNone";
import * as React from "react";
import { LoadingStateIndicator } from "ui/components/loading-state/loading-state-indicator";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";
import { ProfileAvatar } from "ui/components/profile-avatar/profile-avatar";

type Props = { contentClassName?: string };

export const TopBar: React.FC<Props> = props => {
  const classes = useStyles();
  const iconButtonClasses = useIconButtonClasses();
  const [subMenuAnchor, setSubMenuAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const mobileToolbarClasses = useMobileToolbarClasses();

  return (
    <>
      <AppBar position="sticky">
        <LoadingStateIndicator />
        <div className={props.contentClassName}>
          <Toolbar classes={mobileToolbarClasses}>
            <Grid container justify="space-between" alignItems="center">
              <Grid item>
                <SearchBar />
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

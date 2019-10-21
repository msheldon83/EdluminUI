import * as React from "react";
import {
  Grid,
  Typography,
  makeStyles,
  Toolbar,
  AppBar,
  IconButton,
} from "@material-ui/core";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";

type Props = {
  currentOrganizationName: string;
  onSwitch: () => void;
  contentClassName?: string;
};

export const MobileOrganizationSwitcherUI: React.FC<Props> = props => {
  const classes = useStyles();
  const toolbarClasses = useToolbarClasses();

  return (
    <AppBar position="fixed" className={classes.bottomBar}>
      <Toolbar classes={toolbarClasses}>
        <Grid container alignItems="center" justify="space-between">
          <Grid item>
            <Typography className={classes.orgName}>
              {props.currentOrganizationName}
            </Typography>
          </Grid>

          <Grid item>
            <IconButton onClick={props.onSwitch} className={classes.button}>
              <SwapHorizIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};
const useStyles = makeStyles(theme => ({
  bottomBar: {
    bottom: 0,
    top: "auto",
    background: theme.customColors.lightBlue,
  },
  orgName: {
    color: theme.customColors.darkBlueGray,
    fontWeight: 500,
  },
  button: {
    color: theme.customColors.gray,
    paddingTop: 0,
    paddingBottom: 0,
    "&:hover": {
      backgroundColor: "inherit",
    },
  },
}));

const useToolbarClasses = makeStyles(theme => ({
  root: {
    minHeight: theme.typography.pxToRem(34),
  },
  gutters: {
    paddingRight: 0,
  },
}));

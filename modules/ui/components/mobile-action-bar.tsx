import { AppBar, makeStyles, Toolbar } from "@material-ui/core";
import * as React from "react";
import { MobileOnly } from "./mobile-helpers";

type Props = {};
export const MobileActionBar: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <MobileOnly>
      <AppBar position="sticky" className={classes.appBar}>
        <Toolbar color="white">{props.children}</Toolbar>
      </AppBar>
    </MobileOnly>
  );
};

const useStyles = makeStyles(theme => ({
  appBar: {
    bottom: 0,
    left: 0,
    zIndex: 1250,
    backgroundColor: theme.customColors.white,
    "@media print": { display: "none" },
  },
}));

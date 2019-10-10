import { Drawer, Grid, makeStyles } from "@material-ui/core";
import * as React from "react";

type Props = {
  expanded: boolean;
  collapse: () => void;
};
export const MobileNavigationSideBar: React.FC<Props> = props => {
  const classes = useStyles();
  return (
    <Drawer
      open={props.expanded}
      onClose={props.collapse}
      variant="temporary"
      className={classes.drawer}
    >
      <Grid container>
        <Grid item>stuff</Grid>
      </Grid>
    </Drawer>
  );
};

const useStyles = makeStyles(theme => ({
  drawer: {},
}));

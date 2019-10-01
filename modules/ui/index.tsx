import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { Route, Switch } from "react-router-dom";
import { IndexLoader } from "./pages/index/loader";
import { Index } from "./routes";
import { AppShell } from "./components/app";

/** Build the core app store with middlewares and reducer. Used to bootstrap the app to run and to test. */

export function App(props: {}) {
  const classes = useStyles();
  return (
    <AppShell>
      <div className={classes.container}>
        <div className={classes.main}>
          <Switch>
            <Route component={IndexLoader} path={Index.PATH_TEMPLATE} />
          </Switch>
        </div>
      </div>
    </AppShell>
  );
}

// This setup pins the footer to the bottom of the screen. This makes things
// jump much less.
const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    "@media print": {
      height: "auto",
    },
  },
  main: {
    flex: "1 0 auto",
  },
});

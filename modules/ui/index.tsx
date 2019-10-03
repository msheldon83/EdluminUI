import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { useEffect, useCallback } from "react";
import { Route, Switch } from "react-router-dom";
import { IndexLoader } from "./pages/index/loader";
import { Index } from "./routes";
import { AppShell } from "./components/app";
import { useAuth0 } from "auth/auth0";
import { Button } from "@material-ui/core";

/** Build the core app store with middlewares and reducer. Used to bootstrap the app to run and to test. */

export function App(props: {}) {
  const classes = useStyles();
  const auth0 = useAuth0();

  const login = useCallback(() => {
    if (auth0.loading) return;
    /* eslint-disable-next-line */
    auth0.client.loginWithRedirect({
      redirect_uri: Config.Auth0.redirectUrl, //TODO make an abstraction for this in auth0.tsx
    });
  }, [auth0]);
  return (
    <AppShell>
      <div className={classes.container}>
        <div className={classes.main}>
          <Button onClick={login} variant="contained">
            Login
          </Button>
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

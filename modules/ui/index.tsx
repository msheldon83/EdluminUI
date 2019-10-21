import { CssBaseline } from "@material-ui/core";
import { makeStyles, ThemeProvider } from "@material-ui/styles";
import { useAuth0 } from "auth/auth0";
import * as React from "react";
import { Route, Switch } from "react-router-dom";
import { AppChrome } from "./app-chrome";
import { IfAuthenticated } from "./components/auth/if-authenticated";
import { RedirectToLogin } from "./components/auth/redirect-to-login";
import { LoginPageRouteLoader } from "./pages/login/loader";
import { Index, IndexLoader } from "./routes";
import { EdluminTheme } from "./styles/mui-theme";
import { ProfileLoader, Profile } from "./routes/profile";
import { PositionTypeLoader, PositionType } from "./routes/position-type";

/** Build the core app store with middlewares and reducer. Used to bootstrap the app to run and to test. */

export function App(props: {}) {
  const classes = useStyles();
  const auth0 = useAuth0();

  return (
    <ThemeProvider theme={EdluminTheme}>
      <CssBaseline />
      <div className={classes.container}>
        <div className={classes.main}>
          <Switch>
            <Route exact path={"/login"} component={LoginPageRouteLoader} />
            <Route>
              <IfAuthenticated>
                <AppChrome>
                  <Switch>
                    {/* Protected routes go here */}
                    <Route
                      exact
                      component={IndexLoader}
                      path={Index.PATH_TEMPLATE}
                    />
                    <Route
                      component={ProfileLoader}
                      path={Profile.PATH_TEMPLATE}
                    />
                    <Route
                      component={PositionTypeLoader}
                      path={PositionType.PATH_TEMPLATE}
                    />
                  </Switch>
                </AppChrome>
              </IfAuthenticated>
              <IfAuthenticated not>
                <RedirectToLogin />
                {/* <Button onClick={auth0.login} variant="contained">
                  Login
                </Button>
                <Button onClick={auth0.logout} variant="contained">
                  Logout
                </Button> */}
              </IfAuthenticated>
            </Route>
          </Switch>
        </div>
      </div>
    </ThemeProvider>
  );
}

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

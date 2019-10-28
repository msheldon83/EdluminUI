import { CssBaseline } from "@material-ui/core";
import { makeStyles, ThemeProvider } from "@material-ui/styles";
import { useAuth0 } from "auth/auth0";
import * as React from "react";
import { Route, Switch } from "react-router-dom";
import { AppChrome } from "./app-chrome";
import { IfAuthenticated } from "./components/auth/if-authenticated";
import { RedirectToLogin } from "./components/auth/redirect-to-login";
import { LoginPageRouteLoader } from "./pages/login/loader";
import { IndexLoader } from "./routes";
import { AdminChromeRoute, AppChromeRoute } from "./routes/app-chrome";
import {
  OrganizationsLoader,
  OrganizationsNoOrgRoute,
  OrganizationsRoute,
} from "./routes/organizations";
import {
  PositionTypeLoader,
  PositionTypeRoute,
  PositionTypeViewLoader,
  PositionTypeViewRoute,
  PositionTypeAddLoader,
  PositionTypeAddRoute,
  PositionTypeEditSettingsLoader,
  PositionTypeEditSettingsRoute,
} from "./routes/position-type";
import { ProfileLoader, ProfileRoute } from "./routes/profile";
import { EdluminTheme } from "./styles/mui-theme";

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
            <Route exact path={"/"}>
              <IfAuthenticated>
                <Route exact component={IndexLoader} path={"/"} />
              </IfAuthenticated>
              <IfAuthenticated not>
                <RedirectToLogin />
              </IfAuthenticated>
            </Route>
            <Route path={AppChromeRoute.path}>
              <IfAuthenticated>
                <AppChrome>
                  <Switch>
                    {/* Protected routes go here */}

                    <Route component={ProfileLoader} path={ProfileRoute.path} />
                    <Route
                      component={PositionTypeAddLoader}
                      path={PositionTypeAddRoute.path}
                    />
                    <Route
                      component={PositionTypeEditSettingsLoader}
                      path={PositionTypeEditSettingsRoute.path}
                    />
                    <Route
                      component={PositionTypeViewLoader}
                      path={PositionTypeViewRoute.path}
                    />
                    <Route
                      component={PositionTypeLoader}
                      path={PositionTypeRoute.path}
                    />
                  </Switch>

                  <Route path={AdminChromeRoute.path}>
                    {/* Admin routes go here*/}
                    <Switch>
                      {/*We will need to figure out how to prevent non admin users from accessing this route */}
                      <Route
                        component={OrganizationsLoader}
                        path={OrganizationsRoute.path}
                      />
                      <Route
                        component={OrganizationsLoader}
                        path={OrganizationsNoOrgRoute.path}
                      />
                    </Switch>
                  </Route>
                </AppChrome>
              </IfAuthenticated>
              <IfAuthenticated not>
                <RedirectToLogin />
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

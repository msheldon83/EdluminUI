import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { Auth0Context } from "auth/auth0";
import { NavigationSideBar } from "../navigation";
import { Route } from "react-router-dom";
import { AppChromeRoute } from "ui/routes/app-chrome";

export default {
  title: "Components/Navigation Side Bar",
};

export const nav = () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        userAccess: () => ({
          me: {
            user: {
              id: 1234,
            },
          },
        }),
      }),
    },
  });

  return (
    <Provider>
      <Auth0Context.Provider value={{ isAuthenticated: true } as any}>
        <Route
          path={AppChromeRoute.path}
          component={() => (
            <NavigationSideBar
              expanded={true}
              expand={() => {}}
              collapse={() => {}}
            />
          )}
        />
      </Auth0Context.Provider>
    </Provider>
  );
};

nav.story = {
  name: "Open",
};

import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { Auth0Context } from "auth/auth0";
import { NavigationSideBar } from "../navigation";
import { Route } from "react-router-dom";
import { AppChromeRoute, AdminChromeRoute } from "ui/routes/app-chrome";

export default {
  title: "Components/Navigation Side Bar",
};

const render = (path: string) => () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        userAccess: () => ({
          me: {
            user: {
              id: "1234",
            },
          },
        }),
      }),
    },
    initialUrl: path,
  });

  return (
    <Provider>
      <Auth0Context.Provider value={{ isAuthenticated: true } as any}>
        <Route
          path={path}
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

export const asEmployee = render(AppChromeRoute.generate({ role: "employee" }));
export const asSubstitute = render(
  AppChromeRoute.generate({ role: "substitute" })
);
export const asAdmin = render(
  AdminChromeRoute.generate({ organizationId: "some-id" })
);

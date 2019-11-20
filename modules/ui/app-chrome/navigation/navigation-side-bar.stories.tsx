import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { Auth0Context } from "auth/auth0";
import { NavigationSideBar } from "../navigation";
import { Route } from "react-router-dom";
import {
  AppChromeRoute,
  AdminChromeRoute,
  AdminRootChromeRoute,
} from "ui/routes/app-chrome";

export default {
  title: "Components/Navigation Side Bar",
};

const render = (path: string, isSystemAdmin: boolean) => () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        userAccess: () => ({
          me: {
            user: {
              id: "1234",
            },
            isSystemAdministrator: isSystemAdmin,
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

export const asEmployee = render(
  AppChromeRoute.generate({ role: "employee" }),
  false
);
export const asSubstitute = render(
  AppChromeRoute.generate({ role: "substitute" }),
  false
);
export const asAdminInOrg = render(
  AdminChromeRoute.generate({ organizationId: "1000" }),
  true
);
export const asAdminNotInOrg = render(AdminRootChromeRoute.generate({}), true);

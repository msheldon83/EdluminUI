import * as React from "react";
import { NavigationSideBar } from "../navigation";
import { Route } from "react-router-dom";
import { RoleSwitcherUI } from "./role-switcher-ui";
import { mockProvider } from "test-helpers/mock-provider";
import { AppChrome } from "..";
import { AppChromeRoute } from "ui/routes/app-chrome";

import { PageTitle } from "ui/components/page-title";
import { range } from "lodash-es";

export default {
  title: "App Chrome/Role Switcher",
};

export const admin = () => {
  const Provider = mockProvider({
    initialUrl: AppChromeRoute.generate({ role: "admin" }),
    mocks: {
      Query: () => ({
        userAccess: () => ({
          me: {
            isSystemAdministrator: false,
            user: {
              id: 1234,
              orgUsers: [
                {
                  id: 1,
                  isAdmin: true,
                  isEmployee: false,
                  isReplacementEmployee: false,
                },
                {
                  id: 2,
                  isAdmin: false,
                  isEmployee: true,
                  isReplacementEmployee: false,
                },
              ],
            },
          },
        }),
      }),
    },
  });

  return (
    <Provider>
      <Route path={AppChromeRoute.path}>
        <AppChrome>
          <PageTitle title="This is my page title" />
          {range(100).map((_, i) => (
            <p key={i}>this is my page content</p>
          ))}
        </AppChrome>
      </Route>
    </Provider>
  );
};

export const substitute = () => {
  const Provider = mockProvider({
    initialUrl: AppChromeRoute.generate({ role: "admin" }),
    mocks: {
      Query: () => ({
        userAccess: () => ({
          me: {
            isSystemAdministrator: false,
            user: {
              id: 1234,
              orgUsers: [
                {
                  id: 1,
                  isAdmin: false,
                  isEmployee: true,
                  isReplacementEmployee: true,
                },
                {
                  id: 2,
                  isAdmin: false,
                  isEmployee: true,
                  isReplacementEmployee: true,
                },
              ],
            },
          },
        }),
      }),
    },
  });

  return (
    <Provider>
      <Route path={AppChromeRoute.path}>
        <AppChrome>
          <PageTitle title="This is my page title" />
          {range(100).map((_, i) => (
            <p key={i}>this is my page content</p>
          ))}
        </AppChrome>
      </Route>
    </Provider>
  );
};

export const sysAdmin = () => {
  const Provider = mockProvider({
    initialUrl: AppChromeRoute.generate({ role: "substitute" }),
    mocks: {
      Query: () => ({
        userAccess: () => ({
          me: {
            isSystemAdministrator: true,
            user: {
              id: 1234,
              orgUsers: [
                {
                  id: 1,
                  isAdmin: false,
                  isEmployee: true,
                  isReplacementEmployee: true,
                },
                {
                  id: 2,
                  isAdmin: false,
                  isEmployee: true,
                  isReplacementEmployee: true,
                },
              ],
            },
          },
        }),
      }),
    },
  });

  return (
    <Provider>
      <Route path={AppChromeRoute.path}>
        <AppChrome>
          <PageTitle title="This is my page title" />
          {range(100).map((_, i) => (
            <p key={i}>this is my page content</p>
          ))}
        </AppChrome>
      </Route>
    </Provider>
  );
};

//ADD MORE STORIES

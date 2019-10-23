import * as React from "react";
import { NavigationSideBar } from "../navigation";
import { Route } from "react-router-dom";
import { RoleSwitcherUI } from "./role-switcher-ui";
import { mockProvider } from "test-helpers/mock-provider";
import { AppChrome } from "..";
import { AppChromeRoute } from "ui/routes/app-chrome";
import { RoleSwitcher } from ".";

export default {
  title: "Components/Role Switcher",
};

export const nav = () => {
  const Provider = mockProvider({
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
      <RoleSwitcher expanded={true} />
    </Provider>
  );
};

nav.story = {
  name: "Open",
};

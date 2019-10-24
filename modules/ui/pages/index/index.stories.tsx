import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { IndexPage } from ".";
import { Auth0Provider, Auth0Context } from "auth/auth0";

export default {
  title: "Pages/Index Spike",
};

export const whoAmI = () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        userAccess: () => ({
          me: {
            isSystemAdministrator: true,
            user: {
              id: "1234",
            },
          },
        }),
      }),
    },
  });

  return (
    <Provider>
      <Auth0Context.Provider value={{ isAuthenticated: true } as any}>
        <IndexPage />
      </Auth0Context.Provider>
    </Provider>
  );
};

whoAmI.story = {
  name: "Index page redirection",
};

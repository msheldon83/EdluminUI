import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { ExamplePage } from ".";
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
        <ExamplePage />
      </Auth0Context.Provider>
    </Provider>
  );
};

whoAmI.story = {
  name: "Example graphql connected component",
};

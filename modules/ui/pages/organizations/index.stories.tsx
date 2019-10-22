import * as React from "react";
import { OrganizationsPage } from "./index";
import { mockProvider } from "test-helpers/mock-provider";

export default {
  title: "Pages/Organizations",
};

const props = {};

export const Basic = () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        organization: () => ({
          paged: {
            results: [
              {
                id: 1000,
                name: "Test Org 1"
              },
              {
                id: 1001,
                name: "Test Org 2"
              },
            ],
          },
        }),
      }),
    },
  });
  return (
    <Provider>
      <OrganizationsPage {...props} />
    </Provider>
  );
};
Basic.story = {
  name: "List View",
};

export const NoResults = () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        organization: () => ({
          paged: {
            results: [],
          },
        }),
      }),
    },
  });
  return (
    <Provider>
      <OrganizationsPage {...props} />
    </Provider>
  );
};
NoResults.story = {
  name: "No Results",
};

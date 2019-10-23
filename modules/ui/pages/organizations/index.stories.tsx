import * as React from "react";
import { OrganizationsPage } from "./index";
import { mockProvider } from "test-helpers/mock-provider";

export default {
  title: "Pages/Organizations",
};

const props = {};

export const SysAdmin = () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        userAccess: () => ({
          me: {
            isSystemAdministrator: true,
            user: {
              id: 1234,
            },
          },
        }), 
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
SysAdmin.story = {
  name: "List View",
};

export const OrgAdmin = () => {
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
                  id: 1000,
                  isAdmin: true,
                  organization: {
                    id: 1000,
                    name: "Test Org 1"
                  }
                },
                {
                  id: 1001,
                  isAdmin: false,
                  organization: {
                    id: 1001,
                    name: "Test Org 1"
                  }
                }
              ]
            },
          },
        }), 
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
OrgAdmin.story = {
  name: "List View",
};

export const NoResults = () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        userAccess: () => ({
          me: {
            isSystemAdministrator: true,
            user: {
              id: 1234,
            },
          },
        }), 
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

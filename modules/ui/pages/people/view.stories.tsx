import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { PersonViewRoute, PersonViewLoader } from "ui/routes/people";
import { Route } from "react-router-dom";

export default {
  title: "Pages/Person/View",
};

const AdminView = (isActive: boolean) => {
  const Provider = mockProvider({
    initialUrl: PersonViewRoute.generate({
      organizationId: "1000",
      orgUserId: "1000",
    }),
    mocks: {
      Query: () => ({
        orgUser: () => ({
          byId: {
            id: "1000",
            userId: 1000,
            loginEmail: "jschmoe@school.edu",
            rowVersion: "1234567890",
            firstName: "Joe",
            middleName: "Bill",
            lastName: "Schmoe",
            active: isActive,
            isReplacementEmployee: false,
            isEmployee: false,
            isAdmin: true,
            isSuperUser: true,
            email: "jschmoe@school.edu",
            employee: null,
          },
        }),
      }),
    },
  });
  return (
    <Provider>
      <Route component={PersonViewLoader} path={PersonViewRoute.path} />
    </Provider>
  );
};
export const asActiveAdmin = AdminView(true);
export const asInactiveAdmin = AdminView(false);

const EmployeeView = (isActive: boolean) => {
  const Provider = mockProvider({
    initialUrl: PersonViewRoute.generate({
      organizationId: "1000",
      orgUserId: "1001",
    }),
    mocks: {
      Query: () => ({
        orgUser: () => ({
          byId: {
            id: "1000",
            userId: 1000,
            loginEmail: "jschmoe@school.edu",
            rowVersion: "1234567890",
            firstName: "Joe",
            middleName: "Bill",
            lastName: "Schmoe",
            active: isActive,
            isReplacementEmployee: false,
            isEmployee: true,
            isAdmin: false,
            isSuperUser: false,
            email: "jschmoe@school.edu",
            employee: {
              id: "1000",
              rowVersion: "1234567890",
              externalId: "A123",
            },
          },
        }),
      }),
    },
  });
  return (
    <Provider>
      <Route component={PersonViewLoader} path={PersonViewRoute.path} />
    </Provider>
  );
};
export const asActiveEmployee = EmployeeView(true);
export const asInactiveEmployee = EmployeeView(false);

const SubstituteView = (isActive: boolean) => {
  const Provider = mockProvider({
    initialUrl: PersonViewRoute.generate({
      organizationId: "1000",
      orgUserId: "1001",
    }),
    mocks: {
      Query: () => ({
        orgUser: () => ({
          byId: {
            id: "1000",
            userId: 1000,
            loginEmail: "jschmoe@school.edu",
            rowVersion: "1234567890",
            firstName: "Joe",
            middleName: "Bill",
            lastName: "Schmoe",
            active: isActive,
            isReplacementEmployee: true,
            isEmployee: false,
            isAdmin: false,
            isSuperUser: false,
            email: "jschmoe@school.edu",
            employee: {
              id: "1000",
              rowVersion: "1234567890",
              externalId: "A123",
            },
          },
        }),
      }),
    },
  });
  return (
    <Provider>
      <Route component={PersonViewLoader} path={PersonViewRoute.path} />
    </Provider>
  );
};
export const asActiveSubstitute = SubstituteView(true);
export const asInactiveSubstitute = SubstituteView(false);

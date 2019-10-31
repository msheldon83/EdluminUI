import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { PeoplePage } from ".";
import { PeopleRoute } from "ui/routes/people";
import { Route } from "react-router";

export default {
  title: "Pages/People",
};

export const PeopleList = () => {
  const Provider = mockProvider({
    initialUrl: PeopleRoute.generate({ organizationId: "1000" }),
    mocks: {
      Query: () => ({
        orgUser: () => ({
          paged: () => ({
            totalCount: 3,
            results: [
              {
                id: "100",
                firstName: "Jane",
                lastName: "Edwards",
                isEmployee: false,
                isReplacementEmployee: true,
                isAdmin: false,
                active: true,
              },
              {
                id: "101",
                firstName: "John",
                lastName: "Doe",
                isEmployee: true,
                isReplacementEmployee: true,
                isAdmin: false,
                active: true,
              },
              {
                id: "102",
                firstName: "Melanie",
                lastName: "Persons",
                isEmployee: true,
                isReplacementEmployee: false,
                isAdmin: false,
                active: true,
              },
              {
                id: "104",
                firstName: "Angela",
                lastName: "Forence",
                isEmployee: false,
                isReplacementEmployee: false,
                isAdmin: true,
                active: true,
              },
              {
                id: "105",
                firstName: "Jimmy <inactive>",
                lastName: "Smith",
                isEmployee: false,
                isReplacementEmployee: true,
                isAdmin: false,
                active: false,
              },
            ],
          }),
        }),
      }),
    },
  });

  return (
    <Provider>
      <Route path={PeopleRoute.path}>
        <PeoplePage />
      </Route>
    </Provider>
  );
};
PeopleList.story = {
  name: "List View",
};

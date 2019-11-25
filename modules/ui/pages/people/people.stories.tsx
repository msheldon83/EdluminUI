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
                externalId: "1234567889",
                firstName: "Jane",
                lastName: "Edwards",
                email: "jedwards@fakeemail.com",
                phone: "610-555-9870",
                isEmployee: false,
                isReplacementEmployee: true,
                isAdmin: false,
                active: true,
                employee: {
                  locations: [{ name: "One Location" }],
                  endorsements: [{ endorsement: { name: "Good teacher" } }],
                  primaryPosition: { name: "Substitute" },
                },
                adminLocations: [],
                allLocationIdsInScope: true,
                adminPositionTypes: [],
                allPositionTypeIdsInScope: true,
              },
              {
                id: "101",
                externalId: "1234567889",
                firstName: "John",
                lastName: "Doe",
                email: "jdoe@fakeemail.com",
                phone: "610-555-9870",
                isEmployee: true,
                isReplacementEmployee: true,
                isAdmin: false,
                active: true,
                employee: {
                  locations: [
                    { name: "One Location" },
                    { name: "Two Location" },
                  ],
                  endorsements: [
                    { endorsement: { name: "Good teacher" } },
                    { endorsement: { name: "Second endorsement" } },
                  ],
                  primaryPosition: { name: "Substitute" },
                },
                adminLocations: [],
                allLocationIdsInScope: false,
                adminPositionTypes: [],
                allPositionTypeIdsInScope: false,
              },
              {
                id: "102",
                externalId: "1234567889",
                firstName: "Melanie",
                lastName: "Persons",
                email: "mpersons@fakeemail.com",
                phone: "610-555-9870",
                isEmployee: true,
                isReplacementEmployee: false,
                isAdmin: false,
                active: true,
                employee: {
                  locations: [],
                  endorsements: [],
                  primaryPosition: { name: "Math teacher" },
                },
                adminLocations: [
                  { name: "One Location" },
                  { name: "Two Location" },
                ],
                allLocationIdsInScope: false,
                adminPositionTypes: [
                  { name: "Math Teachers" },
                  { name: "English Teachers" },
                ],
                allPositionTypeIdsInScope: false,
              },
              {
                id: "104",
                externalId: "1234567889",
                firstName: "Angela",
                lastName: "Forence",
                email: "aforence@fakeemail.com",
                phone: "610-555-9870",
                isEmployee: false,
                isReplacementEmployee: false,
                isAdmin: true,
                active: true,
                employee: {
                  locations: [{ name: "One Location" }],
                  endorsements: [],
                },
                adminLocations: [{ name: "One Location" }],
                allLocationIdsInScope: false,
                adminPositionTypes: [{ name: "Math Teachers" }],
                allPositionTypeIdsInScope: false,
              },
              {
                id: "105",
                externalId: "1234567889",
                firstName: "Jimmy <inactive>",
                lastName: "Smith",
                email: "jsmith@fakeemail.com",
                phone: "610-555-9870",
                isEmployee: false,
                isReplacementEmployee: true,
                isAdmin: false,
                active: false,
                employee: {
                  locations: [{ name: "One Location" }],
                  endorsements: [{ endorsement: { name: "Good teacher" } }],
                  primaryPosition: { name: "Substitute" },
                },
                adminLocations: [{ name: "One Location" }],
                allLocationIdsInScope: false,
                adminPositionTypes: [],
                allPositionTypeIdsInScope: true,
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

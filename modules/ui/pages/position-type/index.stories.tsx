import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { PositionTypeRoute, PositionTypeLoader } from "ui/routes/position-type";
import { Route } from "react-router-dom";

export default {
  title: "Pages/Position Type/List",
};

export const BasicListView = () => {
  const Provider = mockProvider({
    initialUrl: PositionTypeRoute.generate({
      organizationId: "1000",
    }),
    mocks: {
      Query: () => ({
        positionType: () => ({
          all: [
            {
              id: "1000",
              name: "Math Teacher",
              externalId: "Math-12345235",
              forPermanentPositions: true,
              forStaffAugmentation: false,
              defaultContract: {
                name: "Initial Contract",
              },
            },
            {
              id: "1001",
              name: "Gym Teacher",
              externalId: "Gym-2321342",
              forPermanentPositions: true,
              forStaffAugmentation: true,
              defaultContract: {
                name: "Latest Contract",
              },
            },
          ],
        }),
      }),
    },
  });

  return (
    <Provider>
      <Route component={PositionTypeLoader} path={PositionTypeRoute.path} />
    </Provider>
  );
};
BasicListView.story = {
  name: "Basic List View",
};

export const NoResults = () => {
  const Provider = mockProvider({
    initialUrl: PositionTypeRoute.generate({
      organizationId: "1000",
    }),
    mocks: {
      Query: () => ({
        positionType: () => ({
          all: [],
        }),
      }),
    },
  });

  return (
    <Provider>
      <Route component={PositionTypeLoader} path={PositionTypeRoute.path} />
    </Provider>
  );
};
NoResults.story = {
  name: "No Results",
};

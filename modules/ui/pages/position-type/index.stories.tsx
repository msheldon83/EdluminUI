import * as React from "react";
import { PositionTypePage } from "./index";
import { mockProvider } from "test-helpers/mock-provider";

export default {
  title: "Pages/Position Types",
};

const props = {
  match: {
    params: {
      role: "admin",
      organizationId: 1000,
    },
  },
};

export const Basic = () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        positionType: () => ({
          all: [
            {
              id: 1000,
              name: "Math Teacher",
              externalId: "Math-12345235",
              forPermanentPositions: true,
              forStaffAugmentation: false,
              defaultContract: {
                name: "Initial Contract",
              },
            },
            {
              id: 1001,
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
      <PositionTypePage {...props} />
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
        positionType: () => ({
          all: [],
        }),
      }),
    },
  });
  return (
    <Provider>
      <PositionTypePage {...props} />
    </Provider>
  );
};
NoResults.story = {
  name: "No Results",
};

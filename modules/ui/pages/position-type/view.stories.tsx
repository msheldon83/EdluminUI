import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import {
  PositionTypeViewRoute,
  PositionTypeViewLoader,
} from "ui/routes/position-type";
import { Route } from "react-router-dom";
import { NeedsReplacement } from "graphql/server-types.gen";

export default {
  title: "Pages/Position Type/View",
};

export const BasicView = () => {
  const Provider = mockProvider({
    initialUrl: PositionTypeViewRoute.generate({
      organizationId: "1000",
      positionTypeId: "1000",
    }),
    mocks: {
      Query: () => ({
        positionType: () => ({
          byId: {
            id: "1000",
            name: "Math Teacher",
            externalId: "Math-12345235",
            forPermanentPositions: true,
            forStaffAugmentation: false,
            minAbsenceDurationMinutes: 90,
            needsReplacement: NeedsReplacement.No,
            expired: false,
            defaultContract: {
              id: "1001",
              name: "Initial Contract",
            },
          },
        }),
      }),
    },
  });
  return (
    <Provider>
      <Route
        component={PositionTypeViewLoader}
        path={PositionTypeViewRoute.path}
      />
    </Provider>
  );
};
BasicView.story = {
  name: "Active",
};

export const InactivePositionType = () => {
  const Provider = mockProvider({
    initialUrl: PositionTypeViewRoute.generate({
      organizationId: "1000",
      positionTypeId: "1001",
    }),
    mocks: {
      Query: () => ({
        positionType: () => ({
          byId: {
            id: "1001",
            name: "Gym Teacher",
            externalId: "Gym-12345235",
            forPermanentPositions: true,
            forStaffAugmentation: false,
            minAbsenceDurationMinutes: 90,
            needsReplacement: NeedsReplacement.No,
            expired: true,
            defaultContract: {
              id: "1001",
              name: "Initial Contract",
            },
          },
        }),
      }),
    },
  });
  return (
    <Provider>
      <Route
        component={PositionTypeViewLoader}
        path={PositionTypeViewRoute.path}
      />
    </Provider>
  );
};
InactivePositionType.story = {
  name: "Inactive",
};

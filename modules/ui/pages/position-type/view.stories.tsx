import * as React from "react";
import { PositionTypeViewPage } from "./view";
import { mockProvider } from "test-helpers/mock-provider";

export default {
  title: "Pages/Position Type View",
};

const props = {
  match: {
    params: {
      positionTypeId: 1000,
    },
  },
};

export const Basic = () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        positionType: () => ({
          byId: {
            id: 1000,
            name: "Math Teacher",
            externalId: "Math-12345235",
            forPermanentPositions: true,
            forStaffAugmentation: false,
            minAbsenceDurationMinutes: 90,
            defaultContract: {
              id: 1001,
              name: "Initial Contract",
            },
          },
        }),
      }),
    },
  });
  return (
    <Provider>
      <PositionTypeViewPage {...props} />
    </Provider>
  );
};
Basic.story = {
  name: "Basic View",
};

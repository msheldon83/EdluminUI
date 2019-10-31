import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import {
  PositionTypeAddRoute,
  PositionTypeAddLoader,
} from "ui/routes/position-type";
import { Route } from "react-router-dom";

export default {
  title: "Pages/Position Type/Add",
};

export const BasicAdd = () => {
  const Provider = mockProvider({
    initialUrl: PositionTypeAddRoute.generate({
      organizationId: "1000",
    }),
    mocks: {
      Query: () => ({
        contract: () => ({
          all: [
            {
              id: "1000",
              name: "Contract 1",
              expired: false,
            },
            {
              id: "1001",
              name: "Contract 2",
              expired: false,
            },
            {
              id: "1002",
              name: "Contract 3",
              expired: false,
            },
          ],
        }),
      }),
    },
  });
  return (
    <Provider>
      <Route
        component={PositionTypeAddLoader}
        path={PositionTypeAddRoute.path}
      />
    </Provider>
  );
};
BasicAdd.story = {
  name: "Basic",
};

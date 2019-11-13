import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import {
  BellScheduleAddRoute,
  BellScheduleAddLoader,
} from "ui/routes/bell-schedule";
import { Route } from "react-router-dom";

export default {
  title: "Pages/Bell Schedule/Add",
};

const orgVariants = {
  all: [
    {
      id: "1000",
      name: "Regular",
      isStandard: true,
    },
    {
      id: "1001",
      name: "2 Hr Delay",
      isStandard: false,
    },
    {
      id: "1002",
      name: "3 Hr Delay",
      isStandard: false,
    },
  ],
};

const locations = {
  all: [
    {
      id: "1000",
      name: "Haven Elementary",
    },
    {
      id: "1001",
      name: "Smith Elementary",
    },
    {
      id: "1002",
      name: "Gotham Elementary",
    },
  ],
};

const locationGroups = {
  all: [
    {
      id: "1000",
      name: "Elementary Schools",
    },
    {
      id: "1001",
      name: "Middle Schools",
    },
    {
      id: "1002",
      name: "High Schools",
    },
  ],
};

export const BasicAdd = () => {
  const Provider = mockProvider({
    initialUrl: BellScheduleAddRoute.generate({
      organizationId: "1000",
    }),
    mocks: {
      Query: () => ({
        orgRef_WorkDayScheduleVariantType: () => orgVariants,
        location: () => locations,
        locationGroup: () => locationGroups,
      }),
    },
  });
  return (
    <Provider>
      <Route
        component={BellScheduleAddLoader}
        path={BellScheduleAddRoute.path}
      />
    </Provider>
  );
};
BasicAdd.story = {
  name: "Add",
};

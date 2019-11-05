import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import {
  BellScheduleViewRoute,
  BellScheduleViewLoader,
} from "ui/routes/bell-schedule";
import { Route } from "react-router-dom";

export default {
  title: "Pages/Bell Schedule/View",
};

export const BasicView = () => {
  const Provider = mockProvider({
    initialUrl: BellScheduleViewRoute.generate({
      organizationId: "1000",
      workDayScheduleId: "1000",
    }),
    mocks: {
      Query: () => ({
        workDaySchedule: () => ({
          byId: {
            id: "1000",
            name: "Default Bell Schedule",
            externalId: "ASERAS234",
            expired: false,
            periods: [
              { id: "1000"}, { id: "1001"}, { id: "1002" }
            ],
            variants: [
              { id: "1000"}, { id: "1001"}, { id: "1002" }
            ],
            usages: [
              { id: "1000"}, { id: "1001"}, { id: "1002" }
            ]
          },
        }),
      }),
    },
  });
  return (
    <Provider>
      <Route
        component={BellScheduleViewLoader}
        path={BellScheduleViewRoute.path}
      />
    </Provider>
  );
};
BasicView.story = {
  name: "Active",
};

export const InactiveBellSchedule = () => {
  const Provider = mockProvider({
    initialUrl: BellScheduleViewRoute.generate({
      organizationId: "1000",
      workDayScheduleId: "1001",
    }),
    mocks: {
      Query: () => ({
        workDaySchedule: () => ({
          byId: {
            id: "1000",
            name: "Default Bell Schedule",
            externalId: "ASERAS234",
            expired: true,
            periods: [
              { id: "1000"}, { id: "1001"}, { id: "1002" }
            ],
            variants: [
              { id: "1000"}, { id: "1001"}, { id: "1002" }
            ],
            usages: [
              { id: "1000"}, { id: "1001"}, { id: "1002" }
            ]
          },
        }),
      }),
    },
  });
  return (
    <Provider>
      <Route
        component={BellScheduleViewLoader}
        path={BellScheduleViewRoute.path}
      />
    </Provider>
  );
};
InactiveBellSchedule.story = {
  name: "Inactive",
};

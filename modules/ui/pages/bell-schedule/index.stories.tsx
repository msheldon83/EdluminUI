import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { BellSchedulePage } from ".";
import { BellScheduleRoute } from "ui/routes/bell-schedule";
import { Route } from "react-router";

export default {
  title: "Pages/Bell Schedule/List",
};

export const BellScheduleList = () => {
  const Provider = mockProvider({
    initialUrl: BellScheduleRoute.generate({ organizationId: "1000" }),
    mocks: {
      Query: () => ({
        workDaySchedule: () => ({
          paged: () => ({
            totalCount: 3,
            results: [
              {
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
              {
                id: "1001",
                name: "Another Bell Schedule",
                expired: false,
                periods: [
                  { id: "1003"}, { id: "1004"}
                ],
                variants: [
                  { id: "1003"}, { id: "1004"}, { id: "1005" }
                ],
                usages: []
              },
              {
                id: "1002",
                name: "An expired Bell Schedule",
                expired: true,
                periods: [
                  { id: "1005"}, { id: "1006"}, { id: "1007" }
                ],
                variants: [
                  { id: "1006"}, { id: "1007"}
                ],
                usages: [
                  { id: "1003"}, { id: "1004"}, { id: "1005" }
                ]
              }
            ],
          }),
        }),
      }),
    },
  });

  return (
    <Provider>
      <Route path={BellScheduleRoute.path}>
        <BellSchedulePage />
      </Route>
    </Provider>
  );
};
BellScheduleList.story = {
  name: "Basic List View",
};

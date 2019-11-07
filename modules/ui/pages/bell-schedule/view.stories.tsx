import * as React from "react";
import { mockProvider, MockDefinitions } from "test-helpers/mock-provider";
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
              { id: "1000", name: "Morning", sequence: 1}, 
              { id: "1001", name: "Lunch", sequence: 2}, 
              { id: "1002", name: "Afternoon", sequence: 3 }
            ],
            variants: [
              { id: "1000", isStandard: true, 
                periods: [
                  { 
                    id: "1", 
                    startTime: 28800 as any, 
                    endTime: 43200 as any, 
                    isHalfDayMorningEnd: true, 
                    isHalfDayAfternoonStart: false, 
                    sequence: 1 
                  },
                  { 
                    id: "2", 
                    startTime: 43500 as any, 
                    endTime: 46800 as any, 
                    isHalfDayMorningEnd: false, 
                    isHalfDayAfternoonStart: true, 
                    sequence: 2
                  },
                  { 
                    id: "3", 
                    startTime: 47100 as any, 
                    endTime: 61200 as any, 
                    isHalfDayMorningEnd: false, 
                    isHalfDayAfternoonStart: false, 
                    sequence: 3
                  }
                ]
              },
              { id: "1002", isStandard: false, 
                periods: [
                  { 
                    id: "4", 
                    startTime: 28800 as any, 
                    endTime: 43200 as any, 
                    isHalfDayMorningEnd: true, 
                    isHalfDayAfternoonStart: false, 
                    sequence: 1 
                  },
                  { 
                    id: "5", 
                    startTime: 43500 as any, 
                    endTime: 46800 as any, 
                    isHalfDayMorningEnd: false, 
                    isHalfDayAfternoonStart: true, 
                    sequence: 2
                  },
                  { 
                    id: "6", 
                    startTime: 47100 as any, 
                    endTime: 61200 as any, 
                    isHalfDayMorningEnd: false, 
                    isHalfDayAfternoonStart: false, 
                    sequence: 3
                  }
                ]
              },
              { id: "1003", isStandard: false, 
                periods: [
                  { 
                    id: "7", 
                    startTime: 28800 as any, 
                    endTime: 43200 as any, 
                    isHalfDayMorningEnd: true, 
                    isHalfDayAfternoonStart: false, 
                    sequence: 1 
                  },
                  { 
                    id: "8", 
                    startTime: 43500 as any, 
                    endTime: 46800 as any, 
                    isHalfDayMorningEnd: false, 
                    isHalfDayAfternoonStart: true, 
                    sequence: 2
                  },
                  { 
                    id: "9", 
                    startTime: 47100 as any, 
                    endTime: 61200 as any, 
                    isHalfDayMorningEnd: false, 
                    isHalfDayAfternoonStart: false, 
                    sequence: 3
                  }
                ]
              }
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
            id: "1001",
            name: "Default Bell Schedule",
            externalId: "ASERAS234",
            expired: true,
            periods: [
              { id: "1000", name: "Morning", sequence: 1}, 
              { id: "1001", name: "Lunch", sequence: 2}, 
              { id: "1002", name: "Afternoon", sequence: 3 }
            ],
            variants: [
              { id: "1000", isStandard: true, 
                periods: [
                  { 
                    id: "1", 
                    startTime: 28800 as any, 
                    endTime: 43200 as any, 
                    isHalfDayMorningEnd: true, 
                    isHalfDayAfternoonStart: false, 
                    sequence: 1 
                  },
                  { 
                    id: "2", 
                    startTime: 43500 as any, 
                    endTime: 46800 as any, 
                    isHalfDayMorningEnd: false, 
                    isHalfDayAfternoonStart: true, 
                    sequence: 2
                  },
                  { 
                    id: "3", 
                    startTime: 47100 as any, 
                    endTime: 61200 as any, 
                    isHalfDayMorningEnd: false, 
                    isHalfDayAfternoonStart: false, 
                    sequence: 3
                  }
                ]
              },
              { id: "1002", isStandard: false, 
                periods: [
                  { 
                    id: "4", 
                    startTime: 28800 as any, 
                    endTime: 43200 as any, 
                    isHalfDayMorningEnd: true, 
                    isHalfDayAfternoonStart: false, 
                    sequence: 1 
                  },
                  { 
                    id: "5", 
                    startTime: 43500 as any, 
                    endTime: 46800 as any, 
                    isHalfDayMorningEnd: false, 
                    isHalfDayAfternoonStart: true, 
                    sequence: 2
                  },
                  { 
                    id: "6", 
                    startTime: 47100 as any, 
                    endTime: 61200 as any, 
                    isHalfDayMorningEnd: false, 
                    isHalfDayAfternoonStart: false, 
                    sequence: 3
                  }
                ]
              },
              { id: "1003", isStandard: false, 
                periods: [
                  { 
                    id: "7", 
                    startTime: 28800 as any, 
                    endTime: 43200 as any, 
                    isHalfDayMorningEnd: true, 
                    isHalfDayAfternoonStart: false, 
                    sequence: 1 
                  },
                  { 
                    id: "8", 
                    startTime: 43500 as any, 
                    endTime: 46800 as any, 
                    isHalfDayMorningEnd: false, 
                    isHalfDayAfternoonStart: true, 
                    sequence: 2
                  },
                  { 
                    id: "9", 
                    startTime: 47100 as any, 
                    endTime: 61200 as any, 
                    isHalfDayMorningEnd: false, 
                    isHalfDayAfternoonStart: false, 
                    sequence: 3
                  }
                ]
              }
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

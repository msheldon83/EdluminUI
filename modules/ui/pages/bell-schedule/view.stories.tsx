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

export const BasicView = () => {
  const Provider = mockProvider({
    initialUrl: BellScheduleViewRoute.generate({
      organizationId: "1000",
      workDayScheduleId: "1000",
    }),
    mocks: {
      Query: () => ({
        orgRef_WorkDayScheduleVariantType: () => orgVariants,
        location: () => locations,
        locationGroup: () => locationGroups,
        workDaySchedule: () => ({
          byId: {
            id: "1000",
            name: "Default Bell Schedule",
            externalId: "ASERAS234",
            expired: false,
            periods: [
              { id: "1000", name: "Morning", sequence: 1 },
              { id: "1001", name: "Lunch", sequence: 2 },
              { id: "1002", name: "Afternoon", sequence: 3 },
            ],
            variants: [
              {
                id: "1000",
                isStandard: true,
                workDayScheduleVariantTypeId: "1000",
                periods: [
                  {
                    id: "1",
                    startTime: 28800 as any,
                    endTime: 43200 as any,
                    isHalfDayMorningEnd: true,
                    isHalfDayAfternoonStart: false,
                    sequence: 1,
                    workDaySchedulePeriodId: "1000",
                  },
                  {
                    id: "2",
                    startTime: 43500 as any,
                    endTime: 46800 as any,
                    isHalfDayMorningEnd: false,
                    isHalfDayAfternoonStart: true,
                    sequence: 2,
                    workDaySchedulePeriodId: "1001",
                  },
                  {
                    id: "3",
                    startTime: 47100 as any,
                    endTime: 61200 as any,
                    isHalfDayMorningEnd: false,
                    isHalfDayAfternoonStart: false,
                    sequence: 3,
                    workDaySchedulePeriodId: "1002",
                  },
                ],
              },
              {
                id: "1002",
                isStandard: false,
                workDayScheduleVariantTypeId: "1001",
                periods: [
                  {
                    id: "4",
                    startTime: 28800 as any,
                    endTime: 43200 as any,
                    isHalfDayMorningEnd: true,
                    isHalfDayAfternoonStart: false,
                    sequence: 1,
                    workDaySchedulePeriodId: "1000",
                  },
                  {
                    id: "5",
                    startTime: 43500 as any,
                    endTime: 46800 as any,
                    isHalfDayMorningEnd: false,
                    isHalfDayAfternoonStart: true,
                    sequence: 2,
                    workDaySchedulePeriodId: "1001",
                  },
                  {
                    id: "6",
                    startTime: 47100 as any,
                    endTime: 61200 as any,
                    isHalfDayMorningEnd: false,
                    isHalfDayAfternoonStart: false,
                    sequence: 3,
                    workDaySchedulePeriodId: "1002",
                  },
                ],
              },
              {
                id: "1003",
                isStandard: false,
                workDayScheduleVariantTypeId: "1002",
                periods: [
                  {
                    id: "7",
                    startTime: 28800 as any,
                    endTime: 43200 as any,
                    isHalfDayMorningEnd: true,
                    isHalfDayAfternoonStart: false,
                    sequence: 1,
                    workDaySchedulePeriodId: "1000",
                  },
                  {
                    id: "8",
                    startTime: 43500 as any,
                    endTime: 46800 as any,
                    isHalfDayMorningEnd: false,
                    isHalfDayAfternoonStart: true,
                    sequence: 2,
                    workDaySchedulePeriodId: "1001",
                  },
                  {
                    id: "9",
                    startTime: 47100 as any,
                    endTime: 61200 as any,
                    isHalfDayMorningEnd: false,
                    isHalfDayAfternoonStart: false,
                    sequence: 3,
                    workDaySchedulePeriodId: "1002",
                  },
                ],
              },
            ],
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
        orgRef_WorkDayScheduleVariantType: () => orgVariants,
        location: () => locations,
        locationGroup: () => locationGroups,
        workDaySchedule: () => ({
          byId: {
            id: "1001",
            name: "Default Bell Schedule",
            externalId: "ASERAS234",
            expired: true,
            periods: [
              { id: "1000", name: "Morning", sequence: 1 },
              { id: "1001", name: "Lunch", sequence: 2 },
              { id: "1002", name: "Afternoon", sequence: 3 },
            ],
            variants: [
              {
                id: "1000",
                isStandard: true,
                workDayScheduleVariantTypeId: "1000",
                periods: [
                  {
                    id: "1",
                    startTime: 28800 as any,
                    endTime: 43200 as any,
                    isHalfDayMorningEnd: true,
                    isHalfDayAfternoonStart: false,
                    sequence: 1,
                    workDaySchedulePeriodId: "1000",
                  },
                  {
                    id: "2",
                    startTime: 43500 as any,
                    endTime: 46800 as any,
                    isHalfDayMorningEnd: false,
                    isHalfDayAfternoonStart: true,
                    sequence: 2,
                    workDaySchedulePeriodId: "1001",
                  },
                  {
                    id: "3",
                    startTime: 47100 as any,
                    endTime: 61200 as any,
                    isHalfDayMorningEnd: false,
                    isHalfDayAfternoonStart: false,
                    sequence: 3,
                    workDaySchedulePeriodId: "1002",
                  },
                ],
              },
              {
                id: "1002",
                isStandard: false,
                workDayScheduleVariantTypeId: "1001",
                periods: [
                  {
                    id: "4",
                    startTime: 28800 as any,
                    endTime: 43200 as any,
                    isHalfDayMorningEnd: true,
                    isHalfDayAfternoonStart: false,
                    sequence: 1,
                    workDaySchedulePeriodId: "1000",
                  },
                  {
                    id: "5",
                    startTime: 43500 as any,
                    endTime: 46800 as any,
                    isHalfDayMorningEnd: false,
                    isHalfDayAfternoonStart: true,
                    sequence: 2,
                    workDaySchedulePeriodId: "1001",
                  },
                  {
                    id: "6",
                    startTime: 47100 as any,
                    endTime: 61200 as any,
                    isHalfDayMorningEnd: false,
                    isHalfDayAfternoonStart: false,
                    sequence: 3,
                    workDaySchedulePeriodId: "1002",
                  },
                ],
              },
              {
                id: "1003",
                isStandard: false,
                workDayScheduleVariantTypeId: "1002",
                periods: [
                  {
                    id: "7",
                    startTime: 28800 as any,
                    endTime: 43200 as any,
                    isHalfDayMorningEnd: true,
                    isHalfDayAfternoonStart: false,
                    sequence: 1,
                    workDaySchedulePeriodId: "1000",
                  },
                  {
                    id: "8",
                    startTime: 43500 as any,
                    endTime: 46800 as any,
                    isHalfDayMorningEnd: false,
                    isHalfDayAfternoonStart: true,
                    sequence: 2,
                    workDaySchedulePeriodId: "1001",
                  },
                  {
                    id: "9",
                    startTime: 47100 as any,
                    endTime: 61200 as any,
                    isHalfDayMorningEnd: false,
                    isHalfDayAfternoonStart: false,
                    sequence: 3,
                    workDaySchedulePeriodId: "1002",
                  },
                ],
              },
            ],
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

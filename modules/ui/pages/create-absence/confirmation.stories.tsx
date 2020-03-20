import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { AdminCreateAbsenceRoute } from "ui/routes/create-absence";
import { Confirmation } from "./confirmation";
import {
  VacancyDetail,
  Maybe,
  Absence,
  AbsenceDetail,
  AbsenceReasonUsage,
  DayPart,
  Vacancy,
} from "graphql/server-types.gen";
import { Route } from "react-router";
import { DisabledDate } from "helpers/absence/computeDisabledDates";

export default {
  title: "Pages/Create Absence/Confirmation",
};

const exampleAccountingCodeAndPayCode = {
  accountingCodeAllocations: [
    {
      accountingCode: {
        id: "1005",
        name: "Cash",
      },
    },
  ],
  payCode: {
    id: "1002",
    name: "Double Pay",
  },
};

const complexVacancies = [
  {
    startDate: "2019-11-18",
    startTimeLocal: "2019-11-18T08:00:00",
    endDate: "2019-11-25",
    endTimeLocal: "2019-11-25T15:00:00",
    numDays: 5,
    notesToReplacement:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    positionId: "1",
    details: [
      {
        startDate: "2019-11-18",
        startTimeLocal: "2019-11-18T08:00:00",
        endDate: "2019-11-18",
        endTimeLocal: "2019-11-18T12:00:00",
        locationId: "1",
        location: {
          name: "Evans Elementary School",
        },
        ...exampleAccountingCodeAndPayCode,
      },
      {
        startDate: "2019-11-18",
        startTimeLocal: "2019-11-18T12:15:00",
        endDate: "2019-11-18",
        endTimeLocal: "2019-11-18T15:00:00",
        locationId: "2",
        location: {
          name: "Brook Elementary School",
        },
        ...exampleAccountingCodeAndPayCode,
      },
      {
        startDate: "2019-11-19",
        startTimeLocal: "2019-11-19T08:00:00",
        endDate: "2019-11-19",
        endTimeLocal: "2019-11-19T12:00:00",
        locationId: "1",
        location: {
          name: "Evans Elementary School",
        },
        ...exampleAccountingCodeAndPayCode,
      },
      {
        startDate: "2019-11-19",
        startTimeLocal: "2019-11-19T12:15:00",
        endDate: "2019-11-19",
        endTimeLocal: "2019-11-19T15:00:00",
        locationId: "2",
        location: {
          name: "Brook Elementary School",
        },
        ...exampleAccountingCodeAndPayCode,
      },
      {
        startDate: "2019-11-21",
        startTimeLocal: "2019-11-21T08:00:00",
        endDate: "2019-11-21",
        endTimeLocal: "2019-11-21T12:00:00",
        locationId: "1",
        location: {
          name: "Evans Elementary School",
        },
        ...exampleAccountingCodeAndPayCode,
      },
      {
        startDate: "2019-11-21",
        startTimeLocal: "2019-11-21T12:15:00",
        endDate: "2019-11-21",
        endTimeLocal: "2019-11-21T15:00:00",
        locationId: "2",
        location: {
          name: "Brook Elementary School",
        },
        ...exampleAccountingCodeAndPayCode,
      },
      {
        startDate: "2019-11-22",
        startTimeLocal: "2019-11-22T08:00:00",
        endDate: "2019-11-22",
        endTimeLocal: "2019-11-22T15:00:00",
        locationId: "3",
        location: {
          name: "Haven Elementary School",
        },
        ...exampleAccountingCodeAndPayCode,
      },
      {
        startDate: "2019-11-25",
        startTimeLocal: "2019-11-25T08:00:00",
        endDate: "2019-11-25",
        endTimeLocal: "2019-11-25T12:00:00",
        locationId: "1",
        location: {
          name: "Evans Elementary School",
        },
        ...exampleAccountingCodeAndPayCode,
      },
      {
        startDate: "2019-11-25",
        startTimeLocal: "2019-11-25T12:15:00",
        endDate: "2019-11-25",
        endTimeLocal: "2019-11-25T15:00:00",
        locationId: "2",
        location: {
          name: "Brook Elementary School",
        },
        ...exampleAccountingCodeAndPayCode,
      },
    ] as Maybe<VacancyDetail[]>,
  },
];

const simpleVacancies = [
  {
    startDate: "2019-11-18",
    startTimeLocal: "2019-11-18T08:00:00",
    endDate: "2019-11-18",
    endTimeLocal: "2019-11-18T15:00:00",
    numDays: 1,
    notesToReplacement:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    positionId: "1",
    details: [
      {
        startDate: "2019-11-18",
        startTimeLocal: "2019-11-18T08:00:00",
        endDate: "2019-11-18",
        endTimeLocal: "2019-11-18T15:00:00",
        locationId: "1",
        location: {
          name: "Evans Elementary School",
        },
        assignment: {
          employeeId: "1",
          employee: {
            firstName: "Luke",
            lastName: "Skywalker",
          },
        },
      },
    ] as Maybe<VacancyDetail[]>,
  },
];

const allAbsenceReasons = [
  {
    id: "1",
    name: "Vacation",
  },
  {
    id: "2",
    name: "Illness",
  },
];

const notesToApprover =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore";

const getAbsence = (
  absenceReasonId: string,
  includeVacancies: boolean,
  complexAbsence: boolean,
  includePreArrangedSub: boolean
) => {
  let absence = {
    id: "123456789",
    startDate: "2019-11-18",
    startTimeLocal: "2019-11-18T08:00:00",
    endDate: "2019-11-25",
    endTimeLocal: "2019-11-25T15:00:00",
    numDays: 5,
    employeeId: "1125",
    employee: {
      firstName: "John",
      lastName: "Smith",
    },
    notesToApprover: notesToApprover,
    details: [
      {
        dayPartId: DayPart.FullDay,
        startDate: "2019-11-18",
        startTimeLocal: "2019-11-18T08:00:00",
        endDate: "2019-11-18",
        endTimeLocal: "2019-11-18T15:00:00",
        reasonUsages: [
          {
            absenceReasonId: absenceReasonId,
          } as any,
        ] as Maybe<AbsenceReasonUsage[]>,
      },
      {
        dayPartId: DayPart.FullDay,
        startDate: "2019-11-19",
        startTimeLocal: "2019-11-19T08:00:00",
        endDate: "2019-11-19",
        endTimeLocal: "2019-11-19T15:00:00",
        reasonUsages: [
          {
            absenceReasonId: absenceReasonId,
          } as any,
        ] as Maybe<AbsenceReasonUsage[]>,
      },
      {
        dayPartId: DayPart.FullDay,
        startDate: "2019-11-21",
        startTimeLocal: "2019-11-21T08:00:00",
        endDate: "2019-11-21",
        endTimeLocal: "2019-11-21T15:00:00",
        reasonUsages: [
          {
            absenceReasonId: absenceReasonId,
          } as any,
        ] as Maybe<AbsenceReasonUsage[]>,
      },
      {
        dayPartId: DayPart.FullDay,
        startDate: "2019-11-22",
        startTimeLocal: "2019-11-22T08:00:00",
        endDate: "2019-11-22",
        endTimeLocal: "2019-11-22T15:00:00",
        reasonUsages: [
          {
            absenceReasonId: absenceReasonId,
          } as any,
        ] as Maybe<AbsenceReasonUsage[]>,
      },
      {
        dayPartId: DayPart.FullDay,
        startDate: "2019-11-25",
        startTimeLocal: "2019-11-25T08:00:00",
        endDate: "2019-11-25",
        endTimeLocal: "2019-11-25T15:00:00",
        reasonUsages: [
          {
            absenceReasonId: absenceReasonId,
          } as any,
        ] as Maybe<AbsenceReasonUsage[]>,
      },
    ] as Maybe<AbsenceDetail[]>,
  } as Absence;

  if (!complexAbsence) {
    const firstDetail = absence.details![0];
    absence = {
      ...absence,
      startDate: firstDetail!.startDate,
      startTimeLocal: firstDetail!.startTimeLocal,
      endDate: firstDetail!.endDate,
      endTimeLocal: firstDetail!.endTimeLocal,
      numDays: 1,
      details: [firstDetail],
    };
  }

  if (includeVacancies) {
    absence = {
      ...absence,
      vacancies: complexAbsence
        ? (complexVacancies as Maybe<Vacancy>[])
        : (simpleVacancies as Maybe<Vacancy>[]),
    };

    if (includePreArrangedSub && absence.vacancies) {
      absence.vacancies = absence.vacancies?.map(v => {
        return {
          ...v,
          details: v?.details?.map(d => {
            return {
              ...d,
              assignment: {
                id: "1234",
                employee: {
                  id: "1234",
                  firstName: "Luke",
                  lastName: "Skywalker",
                },
              },
            };
          }),
        } as Maybe<Vacancy>;
      });
    }
  }

  console.log("absence", absence);
  return absence;
};

const disabledDates: DisabledDate[] = [
  { date: new Date("2019-11-2 00:00"), type: "nonWorkDay" },
  { date: new Date("2019-11-9 00:00"), type: "nonWorkDay" },
  { date: new Date("2019-11-16 00:00"), type: "nonWorkDay" },
  { date: new Date("2019-11-30 00:00"), type: "nonWorkDay" },
  { date: new Date("2019-11-5 00:00"), type: "absence" },
  { date: new Date("2019-11-15 00:00"), type: "absence" },
  { date: new Date("2019-11-20 00:00"), type: "absence" },
  { date: new Date("2019-11-23 00:00"), type: "nonWorkDay" },
  { date: new Date("2019-11-24 00:00"), type: "nonWorkDay" },
];

export const AsAdminWithAllInformation = () => {
  const path = AdminCreateAbsenceRoute.generate({
    organizationId: "1006",
    employeeId: "123",
  });
  const Provider = mockProvider({
    initialUrl: path,
    mocks: {
      Query: () => ({
        employee: () => ({
          employeeContractSchedule: () => [],
          employeeAbsenceSchedule: () => [],
        }),
        orgRef_AbsenceReason: () => ({
          all: () => allAbsenceReasons,
        }),
      }),
    },
  });

  return (
    <Provider>
      <Route path={AdminCreateAbsenceRoute.path}>
        <Confirmation
          orgId={"1000"}
          absence={getAbsence("1", true, true, true)}
        />
      </Route>
    </Provider>
  );
};

export const AsAdminWithSimpleAbsence = () => {
  const path = AdminCreateAbsenceRoute.generate({
    organizationId: "1006",
    employeeId: "123",
  });
  const Provider = mockProvider({
    initialUrl: path,
    logMissingMocks: true,
    mocks: {
      Query: () => ({
        employee: () => ({
          employeeContractSchedule: () => [],
          employeeAbsenceSchedule: () => [],
        }),
        orgRef_AbsenceReason: () => ({
          all: () => allAbsenceReasons,
        }),
      }),
    },
  });

  return (
    <Provider>
      <Route path={AdminCreateAbsenceRoute.path}>
        <Confirmation
          orgId={"1000"}
          absence={getAbsence("1", true, false, false)}
        />
      </Route>
    </Provider>
  );
};

export const AsAdminWithMinimumInformation = () => {
  const path = AdminCreateAbsenceRoute.generate({
    organizationId: "1006",
    employeeId: "123",
  });
  const Provider = mockProvider({
    initialUrl: path,
    mocks: {
      Query: () => ({
        employee: () => ({
          employeeContractSchedule: () => [],
          employeeAbsenceSchedule: () => [],
        }),
        orgRef_AbsenceReason: () => ({
          all: () => allAbsenceReasons,
        }),
      }),
    },
  });

  return (
    <Provider>
      <Route path={AdminCreateAbsenceRoute.path}>
        <Confirmation
          orgId={"1000"}
          absence={getAbsence("2", false, false, false)}
        />
      </Route>
    </Provider>
  );
};

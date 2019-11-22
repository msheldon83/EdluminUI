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

export default {
  title: "Pages/Create Absence/Confirmation",
};

const complexVacancies = [
  {
    startDate: "2019-11-19",
    startTimeLocal: "2019-11-19T08:00:00",
    endDate: "2019-11-25",
    endTimeLocal: "2019-11-25T15:00:00",
    numDays: 5,
    notesToReplacement:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    positionId: 1,
    details: [
      {
        startDate: "2019-11-19",
        startTimeLocal: "2019-11-19T08:00:00",
        endDate: "2019-11-19",
        endTimeLocal: "2019-11-19T12:00:00",
        locationId: 1,
        location: {
          name: "Evans Elementary School",
        },
      },
      {
        startDate: "2019-11-19",
        startTimeLocal: "2019-11-19T12:15:00",
        endDate: "2019-11-19",
        endTimeLocal: "2019-11-19T15:00:00",
        locationId: 2,
        location: {
          name: "Brook Elementary School",
        },
      },
      {
        startDate: "2019-11-20",
        startTimeLocal: "2019-11-20T08:00:00",
        endDate: "2019-11-20",
        endTimeLocal: "2019-11-20T12:00:00",
        locationId: 1,
        location: {
          name: "Evans Elementary School",
        },
      },
      {
        startDate: "2019-11-20",
        startTimeLocal: "2019-11-20T12:15:00",
        endDate: "2019-11-20",
        endTimeLocal: "2019-11-20T15:00:00",
        locationId: 2,
        location: {
          name: "Brook Elementary School",
        },
      },
      {
        startDate: "2019-11-21",
        startTimeLocal: "2019-11-21T08:00:00",
        endDate: "2019-11-21",
        endTimeLocal: "2019-11-21T12:00:00",
        locationId: 1,
        location: {
          name: "Evans Elementary School",
        },
      },
      {
        startDate: "2019-11-21",
        startTimeLocal: "2019-11-21T12:15:00",
        endDate: "2019-11-21",
        endTimeLocal: "2019-11-21T15:00:00",
        locationId: 2,
        location: {
          name: "Brook Elementary School",
        },
      },
      {
        startDate: "2019-11-22",
        startTimeLocal: "2019-11-22T08:00:00",
        endDate: "2019-11-22",
        endTimeLocal: "2019-11-22T15:00:00",
        locationId: 3,
        location: {
          name: "Haven Elementary School",
        },
      },
      {
        startDate: "2019-11-25",
        startTimeLocal: "2019-11-25T08:00:00",
        endDate: "2019-11-25",
        endTimeLocal: "2019-11-25T12:00:00",
        locationId: 1,
        location: {
          name: "Evans Elementary School",
        },
      },
      {
        startDate: "2019-11-25",
        startTimeLocal: "2019-11-25T12:15:00",
        endDate: "2019-11-25",
        endTimeLocal: "2019-11-25T15:00:00",
        locationId: 2,
        location: {
          name: "Brook Elementary School",
        },
      },
    ] as Maybe<VacancyDetail[]>,
  },
];

const simpleVacancies = [
  {
    startDate: "2019-11-19",
    startTimeLocal: "2019-11-19T08:00:00",
    endDate: "2019-11-19",
    endTimeLocal: "2019-11-19T15:00:00",
    numDays: 1,
    notesToReplacement:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    positionId: 1,
    details: [
      {
        startDate: "2019-11-19",
        startTimeLocal: "2019-11-19T08:00:00",
        endDate: "2019-11-19",
        endTimeLocal: "2019-11-19T15:00:00",
        locationId: 1,
        location: {
          name: "Evans Elementary School",
        },
        assignment: {
          employeeId: 1,
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
  complexAbsence: boolean
) => {
  let absence = {
    id: "123456789",
    startDate: "2019-11-19",
    startTimeLocal: "2019-11-19T08:00:00",
    endDate: "2019-11-25",
    endTimeLocal: "2019-11-25T15:00:00",
    numDays: 5,
    employeeId: 1125,
    notesToApprover: notesToApprover,
    details: [
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
        startDate: "2019-11-20",
        startTimeLocal: "2019-11-20T08:00:00",
        endDate: "2019-11-20",
        endTimeLocal: "2019-11-20T15:00:00",
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
  }

  return absence;
};

const disabledDates = [
  new Date("2019-11-2 00:00"),
  new Date("2019-11-9 00:00"),
  new Date("2019-11-16 00:00"),
  new Date("2019-11-30 00:00"),
  new Date("2019-11-5 00:00"),
  new Date("2019-11-15 00:00"),
  new Date("2019-11-23 00:00"),
  new Date("2019-11-24 00:00"),
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
        orgRef_AbsenceReason: () => ({
          all: () => allAbsenceReasons,
        }),
      }),
    },
  });

  return (
    <Provider>
      <Confirmation
        orgId={"1000"}
        absence={getAbsence("1", true, true)}
        disabledDates={disabledDates}
        setStep={() => {}}
      />
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
    mocks: {
      Query: () => ({
        orgRef_AbsenceReason: () => ({
          all: () => allAbsenceReasons,
        }),
      }),
    },
  });

  return (
    <Provider>
      <Confirmation
        orgId={"1000"}
        absence={getAbsence("1", true, false)}
        setStep={() => {}}
        disabledDates={disabledDates}
      />
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
        orgRef_AbsenceReason: () => ({
          all: () => allAbsenceReasons,
        }),
      }),
    },
  });

  return (
    <Provider>
      <Confirmation
        orgId={"1000"}
        absence={getAbsence("2", false, false)}
        disabledDates={disabledDates}
        setStep={() => {}}
      />
    </Provider>
  );
};

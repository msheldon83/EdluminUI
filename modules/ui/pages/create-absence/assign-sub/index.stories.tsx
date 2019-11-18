import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { AssignSub } from "./index";
import {
  VacancyQualification,
  VacancyAvailability,
  NeedsReplacement,
  VacancyDetail,
} from "graphql/server-types.gen";
import Maybe from "graphql/tsutils/Maybe";

export default {
  title: "Pages/Create Absence/Assign Sub",
};

const dummyReplacementEmployees = [
  {
    employee: {
      id: "1",
      firstName: "Luke",
      lastName: "Skywalker",
      phoneNumber: "3452346789",
    },
    visible: true,
    qualified: VacancyQualification.Fully,
    qualifiedAtUtc: "1/1/2019" as any,
    qualifiedAtLocal: "1/1/2019" as any,
    available: VacancyAvailability.Yes,
    visibleAtUtc: "1/1/2019" as any,
    visibleAtLocal: "1/1/2019" as any,
    isEmployeeFavorite: true,
    isLocationPositionTypeFavorite: false,
    isSelectable: true,
  },
  {
    employee: {
      id: "2",
      firstName: "Anakin",
      lastName: "Skywalker",
      phoneNumber: "3452346789",
    },
    visible: false,
    qualified: VacancyQualification.NotQualified,
    qualifiedAtUtc: "1/1/2019" as any,
    qualifiedAtLocal: "1/1/2019" as any,
    available: VacancyAvailability.Yes,
    visibleAtUtc: null as any,
    visibleAtLocal: null as any,
    isEmployeeFavorite: true,
    isLocationPositionTypeFavorite: false,
    isSelectable: true,
  },
  {
    employee: {
      id: "3",
      firstName: "Obi-Wan",
      lastName: "Kenobi",
      phoneNumber: "3452346789",
    },
    visible: false,
    qualified: VacancyQualification.Fully,
    qualifiedAtUtc: "1/1/2019" as any,
    qualifiedAtLocal: "1/1/2019" as any,
    available: VacancyAvailability.No,
    visibleAtUtc: "1/1/2021" as any,
    visibleAtLocal: "1/1/2021" as any,
    isEmployeeFavorite: false,
    isLocationPositionTypeFavorite: true,
    isSelectable: true,
  },
  {
    employee: {
      id: "4",
      firstName: "Qui-Gon",
      lastName: "Jinn",
      phoneNumber: "3452346789",
    },
    visible: false,
    qualified: VacancyQualification.Minimally,
    qualifiedAtUtc: "1/1/2019" as any,
    qualifiedAtLocal: "1/1/2019" as any,
    available: VacancyAvailability.MinorConflict,
    visibleAtUtc: "1/1/2021" as any,
    visibleAtLocal: "1/1/2021" as any,
    isEmployeeFavorite: false,
    isLocationPositionTypeFavorite: false,
    isSelectable: false,
  },
];

export const AssignSubToExistingVacancyAsAdmin = () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        absence: () => ({
          replacementEmployeesForVacancy: {
            totalCount: dummyReplacementEmployees.length,
            results: dummyReplacementEmployees,
          },
        }),
      }),
    },
  });
  return (
    <Provider>
      <AssignSub
        orgId={"1006"}
        userIsAdmin={true}
        vacancyId={"1"}
        employeeName={"Mary Smith"}
        positionId={"1"}
        positionName={"Math teacher"}
        vacancies={[
          {
            startTimeLocal: new Date("11/1/2019 08:00 AM"),
            endTimeLocal: new Date("11/3/2019 05:00 PM"),
            numDays: 3,
            positionId: 1,
            details: [
              {
                startTimeLocal: new Date("11/1/2019 07:00 AM"),
                endTimeLocal: new Date("11/1/2019 09:00 AM"),
                locationId: 1,
                location: {
                  name: "Evans Elementary School",
                },
              },
              {
                startTimeLocal: new Date("11/1/2019 09:00 AM"),
                endTimeLocal: new Date("11/1/2019 12:00 PM"),
                locationId: 2,
                location: {
                  name: "Brook Elementary School",
                },
              },
              {
                startTimeLocal: new Date("11/1/2019 01:00 PM"),
                endTimeLocal: new Date("11/1/2019 05:00 PM"),
                locationId: 3,
                location: {
                  name: "Haven Elementary School",
                },
              },
              {
                startTimeLocal: new Date("11/2/2019 07:00 AM"),
                endTimeLocal: new Date("11/2/2019 09:00 AM"),
                locationId: 1,
                location: {
                  name: "Evans Elementary School",
                },
              },
              {
                startTimeLocal: new Date("11/2/2019 09:00 AM"),
                endTimeLocal: new Date("11/2/2019 12:00 PM"),
                locationId: 2,
                location: {
                  name: "Brook Elementary School",
                },
              },
              {
                startTimeLocal: new Date("11/2/2019 01:00 PM"),
                endTimeLocal: new Date("11/2/2019 05:00 PM"),
                locationId: 3,
                location: {
                  name: "Haven Elementary School",
                },
              },
              {
                startTimeLocal: new Date("11/3/2019 07:00 AM"),
                endTimeLocal: new Date("11/3/2019 09:00 AM"),
                locationId: 1,
                location: {
                  name: "Evans Elementary School",
                },
              },
              {
                startTimeLocal: new Date("11/3/2019 09:00 AM"),
                endTimeLocal: new Date("11/3/2019 12:00 PM"),
                locationId: 2,
                location: {
                  name: "Brook Elementary School",
                },
              },
              {
                startTimeLocal: new Date("11/3/2019 01:00 PM"),
                endTimeLocal: new Date("11/3/2019 05:00 PM"),
                locationId: 3,
                location: {
                  name: "Haven Elementary School",
                },
              },
            ] as Maybe<VacancyDetail[]>,
          },
          {
            startTimeLocal: new Date("11/6/2019 08:00 AM"),
            endTimeLocal: new Date("11/7/2019 05:00 PM"),
            numDays: 2,
            positionId: 1,
            details: [
              {
                startTimeLocal: new Date("11/6/2019 07:00 AM"),
                endTimeLocal: new Date("11/6/2019 09:00 AM"),
                locationId: 1,
                location: {
                  name: "Evans Elementary School",
                },
              },
              {
                startTimeLocal: new Date("11/6/2019 09:00 AM"),
                endTimeLocal: new Date("11/6/2019 12:00 PM"),
                locationId: 2,
                location: {
                  name: "Brook Elementary School",
                },
              },
              {
                startTimeLocal: new Date("11/6/2019 01:00 PM"),
                endTimeLocal: new Date("11/6/2019 05:00 PM"),
                locationId: 3,
                location: {
                  name: "Haven Elementary School",
                },
              },
              {
                startTimeLocal: new Date("11/7/2019 07:00 AM"),
                endTimeLocal: new Date("11/7/2019 09:00 AM"),
                locationId: 1,
                location: {
                  name: "Evans Elementary School",
                },
              },
              {
                startTimeLocal: new Date("11/7/2019 09:00 AM"),
                endTimeLocal: new Date("11/7/2019 12:00 PM"),
                locationId: 2,
                location: {
                  name: "Brook Elementary School",
                },
              },
              {
                startTimeLocal: new Date("11/7/2019 01:00 PM"),
                endTimeLocal: new Date("11/7/2019 05:00 PM"),
                locationId: 3,
                location: {
                  name: "Haven Elementary School",
                },
              },
            ] as Maybe<VacancyDetail[]>,
          },
        ]}
      />
    </Provider>
  );
};

AssignSubToExistingVacancyAsAdmin.story = {
  name: "Admin - Existing Vacancy",
};

export const AssignSubToExistingVacancyAsEmployee = () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        absence: () => ({
          replacementEmployeesForVacancy: {
            totalCount: dummyReplacementEmployees.length,
            results: dummyReplacementEmployees,
          },
        }),
      }),
    },
  });
  return (
    <Provider>
      <AssignSub
        orgId={"1006"}
        userIsAdmin={false}
        vacancyId={"1"}
        employeeName={"Mary Smith"}
        positionId={"1"}
        positionName={"Math teacher"}
        vacancies={[
          {
            startTimeLocal: new Date("11/1/2019 08:00 AM"),
            endTimeLocal: new Date("11/10/2019 05:00 PM"),
            numDays: 7,
            positionId: 1,
            details: [
              {
                startTimeLocal: new Date("11/1/2019 07:00 AM"),
                endTimeLocal: new Date("11/1/2019 05:00 PM"),
                locationId: 1,
                location: {
                  name: "Evans Elementary School",
                },
              },
            ] as Maybe<VacancyDetail[]>,
          },
        ]}
      />
    </Provider>
  );
};

AssignSubToExistingVacancyAsEmployee.story = {
  name: "Employee - Existing Vacancy",
};

export const PrearrangeSubAsAdmin = () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        absence: () => ({
          replacementEmployeesForVacancy: {
            totalCount: dummyReplacementEmployees.length,
            results: dummyReplacementEmployees,
          },
        }),
      }),
    },
  });
  return (
    <Provider>
      <AssignSub
        orgId={"1006"}
        userIsAdmin={true}
        employeeName={"Mary Smith"}
        positionId={"1"}
        positionName={"Math teacher"}
        vacancies={[
          {
            startTimeLocal: new Date("11/1/2019 08:00 AM"),
            endTimeLocal: new Date("11/10/2019 05:00 PM"),
            numDays: 7,
            positionId: 1,
            details: [
              {
                startTimeLocal: new Date("11/1/2019 07:00 AM"),
                endTimeLocal: new Date("11/1/2019 05:00 PM"),
                locationId: 1,
                location: {
                  name: "Evans Elementary School",
                },
              },
            ] as Maybe<VacancyDetail[]>,
          },
        ]}
      />
    </Provider>
  );
};

PrearrangeSubAsAdmin.story = {
  name: "Admin - Prearrange",
};

export const PrearrangeSubAsEmployee = () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        absence: () => ({
          replacementEmployeesForVacancy: {
            totalCount: dummyReplacementEmployees.length,
            results: dummyReplacementEmployees,
          },
        }),
      }),
    },
  });
  return (
    <Provider>
      <AssignSub
        orgId={"1006"}
        userIsAdmin={false}
        employeeName={"Mary Smith"}
        positionId={"1"}
        positionName={"Math teacher"}
        vacancies={[
          {
            startTimeLocal: new Date("11/1/2019 08:00 AM"),
            endTimeLocal: new Date("11/10/2019 05:00 PM"),
            numDays: 7,
            positionId: 1,
            details: [
              {
                startTimeLocal: new Date("11/1/2019 07:00 AM"),
                endTimeLocal: new Date("11/1/2019 05:00 PM"),
                locationId: 1,
                location: {
                  name: "Evans Elementary School",
                },
              },
            ] as Maybe<VacancyDetail[]>,
          },
        ]}
      />
    </Provider>
  );
};

PrearrangeSubAsEmployee.story = {
  name: "Employee - Prearrange",
};

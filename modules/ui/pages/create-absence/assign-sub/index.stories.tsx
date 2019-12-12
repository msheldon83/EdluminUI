import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { AssignSub } from "./index";
import {
  VacancyQualification,
  VacancyAvailability,
  Vacancy,
  VacancyDetail,
} from "graphql/server-types.gen";
import Maybe from "graphql/tsutils/Maybe";

export default {
  title: "Pages/Create Absence/Assign Sub",
};

const dummyReplacementEmployees = [
  {
    employeeId: 1,
    firstName: "Luke",
    lastName: "Skywalker",
    phoneNumber: "3452346789",
    isVisible: true,
    levelQualified: VacancyQualification.Fully,
    isQualified: true,
    qualifiedAtUtc: "1/1/2019" as any,
    qualifiedAtLocal: "1/1/2019" as any,
    levelAvailable: VacancyAvailability.Yes,
    isAvailable: true,
    visibleAtUtc: "1/1/2019" as any,
    visibleAtLocal: "1/1/2019" as any,
    isFavoriteEmployee: true,
    isFavoritePositionType: false,
    isSelectable: true,
  },
  {
    employeeId: 2,
    firstName: "Anakin",
    lastName: "Skywalker",
    phoneNumber: "3452346789",
    isVisible: false,
    levelQualified: VacancyQualification.NotQualified,
    isQualified: false,
    qualifiedAtUtc: "1/1/2019" as any,
    qualifiedAtLocal: "1/1/2019" as any,
    levelAvailable: VacancyAvailability.Yes,
    isAvailable: true,
    visibleAtUtc: null as any,
    visibleAtLocal: null as any,
    isFavoriteEmployee: true,
    isFavoritePositionType: false,
    isSelectable: true,
  },
  {
    employeeId: 3,
    firstName: "Obi-Wan",
    lastName: "Kenobi",
    phoneNumber: "3452346789",
    isVisible: false,
    levelQualified: VacancyQualification.Fully,
    isQualified: true,
    qualifiedAtUtc: "1/1/2019" as any,
    qualifiedAtLocal: "1/1/2019" as any,
    levelAvailable: VacancyAvailability.No,
    isAvailable: false,
    visibleAtUtc: "1/1/2021" as any,
    visibleAtLocal: "1/1/2021" as any,
    isFavoriteEmployee: false,
    isFavoritePositionType: true,
    isSelectable: true,
  },
  {
    employeeId: 4,
    firstName: "Qui-Gon",
    lastName: "Jinn",
    phoneNumber: "3452346789",
    isVisible: false,
    levelQualified: VacancyQualification.Minimally,
    isQualified: true,
    qualifiedAtUtc: "1/1/2019" as any,
    qualifiedAtLocal: "1/1/2019" as any,
    levelAvailable: VacancyAvailability.MinorConflict,
    isAvailable: false,
    visibleAtUtc: "1/1/2021" as any,
    visibleAtLocal: "1/1/2021" as any,
    isFavoriteEmployee: false,
    isFavoritePositionType: false,
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
        existingVacancy
        employeeName={"Mary Smith"}
        positionId={"1"}
        positionName={"Math teacher"}
        setStep={() => {}}
        setValue={() => {}}
        vacancies={
          [
            {
              startDate: "2019-11-1",
              startTimeLocal: new Date("11/1/2019 08:00 AM"),
              endDate: "2019-11-3",
              endTimeLocal: new Date("11/3/2019 05:00 PM"),
              numDays: 3,
              positionId: 1,
              details: [
                {
                  startDate: "2019-11-1",
                  startTimeLocal: new Date("11/1/2019 07:00 AM"),
                  endDate: "2019-11-1",
                  endTimeLocal: new Date("11/1/2019 09:00 AM"),
                  locationId: 1,
                  location: {
                    name: "Evans Elementary School",
                  },
                },
                {
                  startDate: "2019-11-1",
                  startTimeLocal: new Date("11/1/2019 09:00 AM"),
                  endDate: "2019-11-1",
                  endTimeLocal: new Date("11/1/2019 12:00 PM"),
                  locationId: 2,
                  location: {
                    name: "Brook Elementary School",
                  },
                },
                {
                  startDate: "2019-11-1",
                  startTimeLocal: new Date("11/1/2019 01:00 PM"),
                  endDate: "2019-11-1",
                  endTimeLocal: new Date("11/1/2019 05:00 PM"),
                  locationId: 3,
                  location: {
                    name: "Haven Elementary School",
                  },
                },
                {
                  startDate: "2019-11-2",
                  startTimeLocal: new Date("11/2/2019 07:00 AM"),
                  endDate: "2019-11-2",
                  endTimeLocal: new Date("11/2/2019 09:00 AM"),
                  locationId: 1,
                  location: {
                    name: "Evans Elementary School",
                  },
                },
                {
                  startDate: "2019-11-2",
                  startTimeLocal: new Date("11/2/2019 09:00 AM"),
                  endDate: "2019-11-2",
                  endTimeLocal: new Date("11/2/2019 12:00 PM"),
                  locationId: 2,
                  location: {
                    name: "Brook Elementary School",
                  },
                },
                {
                  startDate: "2019-11-2",
                  startTimeLocal: new Date("11/2/2019 01:00 PM"),
                  endDate: "2019-11-2",
                  endTimeLocal: new Date("11/2/2019 05:00 PM"),
                  locationId: 3,
                  location: {
                    name: "Haven Elementary School",
                  },
                },
                {
                  startDate: "2019-11-3",
                  startTimeLocal: new Date("11/3/2019 07:00 AM"),
                  endDate: "2019-11-3",
                  endTimeLocal: new Date("11/3/2019 09:00 AM"),
                  locationId: 1,
                  location: {
                    name: "Evans Elementary School",
                  },
                },
                {
                  startDate: "2019-11-3",
                  startTimeLocal: new Date("11/3/2019 09:00 AM"),
                  endDate: "2019-11-3",
                  endTimeLocal: new Date("11/3/2019 12:00 PM"),
                  locationId: 2,
                  location: {
                    name: "Brook Elementary School",
                  },
                },
                {
                  startDate: "2019-11-3",
                  startTimeLocal: new Date("11/3/2019 01:00 PM"),
                  endDate: "2019-11-3",
                  endTimeLocal: new Date("11/3/2019 05:00 PM"),
                  locationId: 3,
                  location: {
                    name: "Haven Elementary School",
                  },
                },
              ] as Maybe<VacancyDetail[]>,
            },
            {
              startDate: "2019-11-6",
              startTimeLocal: new Date("11/6/2019 08:00 AM"),
              endDate: "2019-11-7",
              endTimeLocal: new Date("11/7/2019 05:00 PM"),
              numDays: 2,
              positionId: 1,
              details: [
                {
                  startDate: "2019-11-6",
                  startTimeLocal: new Date("11/6/2019 07:00 AM"),
                  endDate: "2019-11-6",
                  endTimeLocal: new Date("11/6/2019 09:00 AM"),
                  locationId: 1,
                  location: {
                    name: "Evans Elementary School",
                  },
                },
                {
                  startDate: "2019-11-6",
                  startTimeLocal: new Date("11/6/2019 09:00 AM"),
                  endDate: "2019-11-6",
                  endTimeLocal: new Date("11/6/2019 12:00 PM"),
                  locationId: 2,
                  location: {
                    name: "Brook Elementary School",
                  },
                },
                {
                  startDate: "2019-11-6",
                  startTimeLocal: new Date("11/6/2019 01:00 PM"),
                  endDate: "2019-11-6",
                  endTimeLocal: new Date("11/6/2019 05:00 PM"),
                  locationId: 3,
                  location: {
                    name: "Haven Elementary School",
                  },
                },
                {
                  startDate: "2019-11-7",
                  startTimeLocal: new Date("11/7/2019 07:00 AM"),
                  endDate: "2019-11-7",
                  endTimeLocal: new Date("11/7/2019 09:00 AM"),
                  locationId: 1,
                  location: {
                    name: "Evans Elementary School",
                  },
                },
                {
                  startDate: "2019-11-7",
                  startTimeLocal: new Date("11/7/2019 09:00 AM"),
                  endDate: "2019-11-7",
                  endTimeLocal: new Date("11/7/2019 12:00 PM"),
                  locationId: 2,
                  location: {
                    name: "Brook Elementary School",
                  },
                },
                {
                  startDate: "2019-11-7",
                  startTimeLocal: new Date("11/7/2019 01:00 PM"),
                  endDate: "2019-11-7",
                  endTimeLocal: new Date("11/7/2019 05:00 PM"),
                  locationId: 3,
                  location: {
                    name: "Haven Elementary School",
                  },
                },
              ] as Maybe<VacancyDetail[]>,
            },
          ] as Vacancy[]
        }
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
        existingVacancy
        employeeName={"Mary Smith"}
        positionId={"1"}
        positionName={"Math teacher"}
        setStep={() => {}}
        setValue={() => {}}
        vacancies={
          [
            {
              startDate: "2019-11-1",
              startTimeLocal: new Date("11/1/2019 08:00 AM"),
              endDate: "2019-11-10",
              endTimeLocal: new Date("11/10/2019 05:00 PM"),
              numDays: 7,
              positionId: 1,
              details: [
                {
                  startDate: "2019-11-1",
                  startTimeLocal: new Date("11/1/2019 07:00 AM"),
                  endDate: "2019-11-1",
                  endTimeLocal: new Date("11/1/2019 05:00 PM"),
                  locationId: 1,
                  location: {
                    name: "Evans Elementary School",
                  },
                },
              ] as Maybe<VacancyDetail>[],
            },
          ] as Vacancy[]
        }
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
        setStep={() => {}}
        setValue={() => {}}
        vacancies={
          [
            {
              startDate: "2019-11-1",
              startTimeLocal: new Date("11/1/2019 08:00 AM"),
              endDate: "2019-11-10",
              endTimeLocal: new Date("11/10/2019 05:00 PM"),
              numDays: 7,
              positionId: 1,
              details: [
                {
                  startDate: "2019-11-1",
                  startTimeLocal: new Date("11/1/2019 07:00 AM"),
                  endDate: "2019-11-1",
                  endTimeLocal: new Date("11/1/2019 05:00 PM"),
                  locationId: 1,
                  location: {
                    name: "Evans Elementary School",
                  },
                },
              ] as Maybe<VacancyDetail[]>,
            },
          ] as Vacancy[]
        }
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
        setStep={() => {}}
        setValue={() => {}}
        vacancies={
          [
            {
              startDate: "2019-11-1",
              startTimeLocal: new Date("11/1/2019 08:00 AM"),
              endDate: "2019-11-10",
              endTimeLocal: new Date("11/10/2019 05:00 PM"),
              numDays: 7,
              positionId: 1,
              details: [
                {
                  startDate: "2019-11-1",
                  startTimeLocal: new Date("11/1/2019 07:00 AM"),
                  endDate: "2019-11-1",
                  endTimeLocal: new Date("11/1/2019 05:00 PM"),
                  locationId: 1,
                  location: {
                    name: "Evans Elementary School",
                  },
                },
              ] as Maybe<VacancyDetail[]>,
            },
          ] as Vacancy[]
        }
      />
    </Provider>
  );
};

PrearrangeSubAsEmployee.story = {
  name: "Employee - Prearrange",
};

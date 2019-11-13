import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { AssignSub } from "./assign-sub";
import { Qualified, Available } from "graphql/server-types.gen";

export default {
  title: "Pages/Create Absence/Assign Sub",
};

const dummyReplacementEmployees = [
  {
    employee: {
      id: "1",
      firstName: "Luke",
      lastName: "Skywalker",
    },
    visible: true,
    qualified: Qualified.Fully,
    available: Available.Yes,
    visibleOnUtc: "1/1/2019" as any,
    visibleOnLocal: "1/1/2019" as any,
    isEmployeeFavorite: true,
    isLocationPositionTypeFavorite: false,
  },
  {
    employee: {
      id: "2",
      firstName: "Anakin",
      lastName: "Skywalker",
    },
    visible: false,
    qualified: Qualified.NotQualified,
    available: Available.Yes,
    visibleOnUtc: null as any,
    visibleOnLocal: null as any,
    isEmployeeFavorite: true,
    isLocationPositionTypeFavorite: false,
  },
  {
    employee: {
      id: "3",
      firstName: "Obi-Wan",
      lastName: "Kenobi",
    },
    visible: false,
    qualified: Qualified.Fully,
    available: Available.No,
    visibleOnUtc: "1/1/2021" as any,
    visibleOnLocal: "1/1/2021" as any,
    isEmployeeFavorite: false,
    isLocationPositionTypeFavorite: true,
  },
  {
    employee: {
      id: "4",
      firstName: "Qui-Gon",
      lastName: "Jinn",
    },
    visible: false,
    qualified: Qualified.Minimally,
    available: Available.MinorConflict,
    visibleOnUtc: "1/1/2021" as any,
    visibleOnLocal: "1/1/2021" as any,
    isEmployeeFavorite: false,
    isLocationPositionTypeFavorite: false,
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
        isEmployee={false}
        vacancyId={"1"}
        employeeName={"Mary Smith"}
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
        isEmployee={true}
        vacancyId={"1"}
        employeeName={"Mary Smith"}
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
        isEmployee={false}
        employeeName={"Mary Smith"}
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
      <AssignSub orgId={"1006"} isEmployee={true} employeeName={"Mary Smith"} />
    </Provider>
  );
};

PrearrangeSubAsEmployee.story = {
  name: "Employee - Prearrange",
};

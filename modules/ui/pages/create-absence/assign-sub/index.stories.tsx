import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { AssignSub } from "./index";
import {
  VacancyQualification,
  VacancyAvailability,
} from "graphql/server-types.gen";

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
    qualified: VacancyQualification.Fully,
    available: VacancyAvailability.Yes,
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
    qualified: VacancyQualification.NotQualified,
    available: VacancyAvailability.Yes,
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
    qualified: VacancyQualification.Fully,
    available: VacancyAvailability.No,
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
    qualified: VacancyQualification.Minimally,
    available: VacancyAvailability.MinorConflict,
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
        userIsAdmin={true}
        vacancyId={"1"}
        employeeName={"Mary Smith"}
        positionName={"Math teacher"}
        vacancyStartDate={new Date("11/1/2019")}
        vacancyEndDate={new Date("11/10/2019")}
        vacancyDays={7}
        vacancyDetails={[
          {
            startDate: new Date("11/1/2019"),
            endDate: new Date("11/5/2019"),
            blocks: [
              {
                startTime: "7:00 AM",
                endTime: "9:00 AM",
                locationName: "Evans Elementary School",
              },
              {
                startTime: "9:00 AM",
                endTime: "12:00 PM",
                locationName: "Brook Elementary School",
              },
              {
                startTime: "1:00 PM",
                endTime: "5:00 PM",
                locationName: "Haven Elementary School",
              },
            ],
          },
          {
            startDate: new Date("11/6/2019"),
            endDate: new Date("11/10/2019"),
            blocks: [
              {
                startTime: "7:00 AM",
                endTime: "9:00 AM",
                locationName: "Evans Elementary School",
              },
              {
                startTime: "9:00 AM",
                endTime: "12:00 PM",
                locationName: "Brook Elementary School",
              },
              {
                startTime: "1:00 PM",
                endTime: "5:00 PM",
                locationName: "Haven Elementary School",
              },
            ],
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
        positionName={"Math teacher"}
        vacancyStartDate={new Date("11/1/2019")}
        vacancyEndDate={new Date("11/10/2019")}
        vacancyDays={7}
        vacancyDetails={[
          {
            startDate: new Date("11/1/2019"),
            endDate: new Date("11/10/2019"),
            blocks: [
              {
                startTime: "07:00 AM",
                endTime: "05:00 PM",
                locationName: "Evans Elementary School",
              },
            ],
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
        positionName={"Math teacher"}
        vacancyStartDate={new Date("11/1/2019")}
        vacancyEndDate={new Date("11/10/2019")}
        vacancyDays={7}
        vacancyDetails={[
          {
            startDate: new Date("11/1/2019"),
            endDate: new Date("11/10/2019"),
            blocks: [
              {
                startTime: "07:00 AM",
                endTime: "05:00 PM",
                locationName: "Evans Elementary School",
              },
            ],
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
        positionName={"Math teacher"}
        vacancyStartDate={new Date("11/1/2019")}
        vacancyEndDate={new Date("11/10/2019")}
        vacancyDays={7}
        vacancyDetails={[
          {
            startDate: new Date("11/1/2019"),
            endDate: new Date("11/10/2019"),
            blocks: [
              {
                startTime: "07:00 AM",
                endTime: "05:00 PM",
                locationName: "Evans Elementary School",
              },
            ],
          },
        ]}
      />
    </Provider>
  );
};

PrearrangeSubAsEmployee.story = {
  name: "Employee - Prearrange",
};

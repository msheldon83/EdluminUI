import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { CreateAbsence } from ".";
import {
  AdminCreateAbsenceRoute,
  EmployeeCreateAbsenceRoute,
} from "ui/routes/create-absence";
import { Route } from "react-router";
import { CreateAbsenceUI } from "./ui";
import {
  NeedsReplacement,
  VacancyAvailability,
  VacancyQualification,
  CalendarDayType,
  Vacancy,
} from "graphql/server-types.gen";

export default {
  title: "Pages/Create Absence",
};

const basicProjectedVacancies = [
  {
    startDate: "2019-11-15",
    startTimeLocal: "2019-11-15T08:30:00",
    endDate: "2019-11-18",
    endTimeLocal: "2019-11-18T12:00:00",
    numDays: 2,
    positionId: 1057,
    details: [
      {
        startDate: "2019-11-15",
        startTimeLocal: "2019-11-15T08:30:00",
        endDate: "2019-11-15",
        endTimeLocal: "2019-11-15T12:00:00",
        location: {
          name: "Haven Elementary School",
        },
        locationId: 1013,
      },
      {
        startDate: "2019-11-18",
        startTimeLocal: "2019-11-18T08:30:00",
        endDate: "2019-11-18",
        endTimeLocal: "2019-11-18T12:00:00",
        location: {
          name: "Haven Elementary School",
        },
        locationId: 1013,
      },
    ],
  },
] as Vacancy[];
const basicReplacementEmployees = [
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
];

export const AsAdmin = () => {
  const path = AdminCreateAbsenceRoute.generate({
    organizationId: "1006",
    employeeId: "123",
  });
  const Provider = mockProvider({
    initialUrl: path,
    mocks: {
      Query: () => ({
        absence: () => ({
          projectedVacancies: basicProjectedVacancies,
          replacementEmployeesForVacancy: {
            totalCount: basicReplacementEmployees.length,
            results: basicReplacementEmployees,
          },
        }),
        employee: () => ({
          employeeContractSchedule: () => [],
          employeeAbsenceSchedule: () => [],
        }),
      }),
    },
  });
  return (
    <Provider>
      <Route path={AdminCreateAbsenceRoute.path}>
        <CreateAbsenceUI
          firstName="Jane"
          lastName="Doe"
          employeeId="123"
          organizationId="124"
          userIsAdmin
          needsReplacement={NeedsReplacement.Yes}
          positionName="Math Teacher"
          positionId={"1"}
        />
      </Route>
    </Provider>
  );
};

export const AsEmployee = () => {
  const path = EmployeeCreateAbsenceRoute.generate({ role: "employee" });
  const Provider = mockProvider({
    initialUrl: path,
    mocks: {
      Query: () => ({
        absence: () => ({
          projectedVacancies: basicProjectedVacancies,
          replacementEmployeesForVacancy: {
            totalCount: basicReplacementEmployees.length,
            results: basicReplacementEmployees,
          },
        }),
        employee: () => ({
          employeeContractSchedule: () => [],
          employeeAbsenceSchedule: () => [],
        }),
      }),
    },
  });
  return (
    <Provider>
      <Route path={EmployeeCreateAbsenceRoute.path}>
        <CreateAbsenceUI
          actingAsEmployee
          firstName="Jane"
          lastName="Doe"
          employeeId="123"
          organizationId="124"
          userIsAdmin={false}
          needsReplacement={NeedsReplacement.Sometimes}
          positionName="Math Teacher"
          positionId={"1"}
        />
      </Route>
    </Provider>
  );
};

export const AsSubNotNeededEmployee = () => {
  const path = EmployeeCreateAbsenceRoute.generate({ role: "employee" });
  const Provider = mockProvider({
    initialUrl: path,
    mocks: {
      Query: () => ({
        absence: () => ({
          projectedVacancies: basicProjectedVacancies,
          replacementEmployeesForVacancy: {
            totalCount: basicReplacementEmployees.length,
            results: basicReplacementEmployees,
          },
        }),
        employee: () => ({
          employeeContractSchedule: () => [],
          employeeAbsenceSchedule: () => [],
        }),
      }),
    },
  });
  return (
    <Provider>
      <Route path={EmployeeCreateAbsenceRoute.path}>
        <CreateAbsenceUI
          firstName="Jane"
          lastName="Doe"
          actingAsEmployee
          employeeId="123"
          organizationId="124"
          needsReplacement={NeedsReplacement.No}
          userIsAdmin={false}
          positionName="Math Teacher"
          positionId={"1"}
        />
      </Route>
    </Provider>
  );
};

export const AsSubNeededEmployee = () => {
  const path = EmployeeCreateAbsenceRoute.generate({ role: "employee" });
  const Provider = mockProvider({
    initialUrl: path,
    mocks: {
      Query: () => ({
        userAccess: () => ({
          me: () => ({
            user: () => ({
              orgUsers: [
                {
                  isAdmin: false,
                },
              ],
            }),
          }),
        }),
        employee: () => ({
          employeeContractSchedule: () => [],
          employeeAbsenceSchedule: () => [],
          byId: {
            id: "123",
            primaryPosition: {
              needsReplacement: NeedsReplacement.Yes,
            },
          },
        }),
        absence: () => ({
          projectedVacancies: basicProjectedVacancies,
          replacementEmployeesForVacancy: {
            totalCount: basicReplacementEmployees.length,
            results: basicReplacementEmployees,
          },
        }),
      }),
    },
  });
  return (
    <Provider>
      <Route path={EmployeeCreateAbsenceRoute.path}>
        <CreateAbsenceUI
          firstName="Jane"
          lastName="Doe"
          actingAsEmployee
          employeeId="123"
          organizationId="124"
          userIsAdmin={false}
          needsReplacement={NeedsReplacement.Yes}
          positionName="Math Teacher"
          positionId={"1"}
        />
      </Route>
    </Provider>
  );
};

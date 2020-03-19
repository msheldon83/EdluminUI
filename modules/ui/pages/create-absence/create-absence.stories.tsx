import {
  NeedsReplacement,
  Vacancy,
  VacancyAvailability,
  VacancyQualification,
  PositionScheduleDate,
  FeatureFlag,
} from "graphql/server-types.gen";
import * as React from "react";
import { Route } from "react-router";
import { mockProvider } from "test-helpers/mock-provider";
import {
  AdminCreateAbsenceRoute,
  EmployeeCreateAbsenceRoute,
} from "ui/routes/create-absence";
import { CreateAbsenceUI } from "./ui";

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
    positionId: "1057",
    details: [
      {
        startDate: "2019-11-15",
        startTimeLocal: "2019-11-15T08:30:00",
        endDate: "2019-11-15",
        endTimeLocal: "2019-11-15T12:00:00",
        location: {
          name: "Haven Elementary School",
        },
        locationId: "1013",
      },
      {
        startDate: "2019-11-18",
        startTimeLocal: "2019-11-18T08:30:00",
        endDate: "2019-11-18",
        endTimeLocal: "2019-11-18T12:00:00",
        location: {
          name: "Haven Elementary School",
        },
        locationId: "1013",
      },
    ],
  },
] as Vacancy[];

const basicReplacementEmployees = [
  {
    employeeId: "1",
    firstName: "Luke",
    lastName: "Skywalker",
    phoneNumber: "3452346789",
    isVisible: true,
    levelQualified: VacancyQualification.Fully,
    qualifiedAtUtc: "1/1/2019" as any,
    qualifiedAtLocal: "1/1/2019" as any,
    levelAvailable: VacancyAvailability.Yes,
    visibleAtUtc: "1/1/2019" as any,
    visibleAtLocal: "1/1/2019" as any,
    isFavoriteEmployee: true,
    isFavoritePositionType: false,
    isSelectable: true,
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

const employeeScheduleTimes = [
  {
    startTimeLocal: "2019-11-18T08:30:00",
    endTimeLocal: "2019-11-18T17:00:00",
    halfDayMorningEndLocal: "2019-11-18T12:00:00",
    halfDayAfternoonStartLocal: "2019-11-18T13:00:00",
  },
] as PositionScheduleDate[];

const organization = {
  config: {
    featureFlags: [
      FeatureFlag.FullDayAbsences,
      FeatureFlag.HalfDayAbsences,
      FeatureFlag.HourlyAbsences,
    ],
  },
};

export const AsAdmin = () => {
  const path = AdminCreateAbsenceRoute.generate({
    organizationId: "1006",
    employeeId: "123",
  });

  const Provider = mockProvider({
    initialUrl: path,
    logMissingMocks: true,
    mocks: {
      Query: () => ({
        organization: () => ({
          byId: () => organization,
        }),
        orgRef_AbsenceReason: () => ({
          all: () => allAbsenceReasons,
        }),
        orgRef_AccountingCode: () => ({
          all: () => [],
        }),
        orgRef_PayCode: () => ({
          all: () => [],
        }),
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
          employeePositionSchedule: () => employeeScheduleTimes,
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
          organizationId="1006"
          needsReplacement={NeedsReplacement.Yes}
          positionName="Math Teacher"
          positionId="1057"
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
        organization: () => ({
          byId: () => organization,
        }),
        orgRef_AbsenceReason: () => ({
          all: () => allAbsenceReasons,
        }),
        orgRef_AccountingCode: () => ({
          all: () => [],
        }),
        orgRef_PayCode: () => ({
          all: () => [],
        }),
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
          employeePositionSchedule: () => employeeScheduleTimes,
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
          organizationId="1006"
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
        organization: () => ({
          byId: () => organization,
        }),
        orgRef_AbsenceReason: () => ({
          all: () => allAbsenceReasons,
        }),
        orgRef_AccountingCode: () => ({
          all: () => [],
        }),
        orgRef_PayCode: () => ({
          all: () => [],
        }),
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
          employeePositionSchedule: () => employeeScheduleTimes,
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
          organizationId="1006"
          needsReplacement={NeedsReplacement.No}
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
        organization: () => ({
          byId: () => organization,
        }),
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
          employeePositionSchedule: () => employeeScheduleTimes,
          byId: {
            id: "123",
            primaryPosition: {
              needsReplacement: NeedsReplacement.Yes,
            },
          },
        }),
        orgRef_AbsenceReason: () => ({
          all: () => allAbsenceReasons,
        }),
        orgRef_AccountingCode: () => ({
          all: () => [],
        }),
        orgRef_PayCode: () => ({
          all: () => [],
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
          needsReplacement={NeedsReplacement.Yes}
          positionName="Math Teacher"
          positionId={"1"}
        />
      </Route>
    </Provider>
  );
};

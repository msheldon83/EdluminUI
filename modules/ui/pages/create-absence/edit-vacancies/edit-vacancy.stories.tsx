import * as React from "react";
import { Route } from "react-router";
import { mockProvider } from "test-helpers/mock-provider";
import { AdminCreateAbsenceRoute } from "ui/routes/create-absence";
import { GetProjectedVacancies } from "../graphql/get-projected-vacancies.gen";
import { EditVacancies } from ".";
import { AbsenceVacancyInput, Vacancy } from "graphql/server-types.gen";
import { VacancyDetail } from "../../../components/absence/types";

export default {
  title: "Pages/Create Absence/Edit Absence",
};

const formVacancyValues: VacancyDetail[] = [
  {
    date: "2019-11-15",
    startTime: "2019-11-15T08:30:00" as any,
    endTime: "2019-11-15T12:00:00" as any,
    locationId: 1013,
  },
  {
    date: "2019-11-18" as any,
    startTime: "2019-11-18T08:30:00" as any,
    endTime: "2019-11-18T12:00:00" as any,
    locationId: 1013,
  },
];

const projectedVacancies: GetProjectedVacancies.ProjectedVacancies[] = [
  {
    positionId: 1057,
    startTimeLocal: "2019-11-15T08:30:00" as any,
    endTimeLocal: "2019-11-18T12:00:00" as any,
    numDays: 2,
    details: [
      {
        startTimeLocal: "2019-11-15T08:30:00" as any,
        endTimeLocal: "2019-11-15T12:00:00" as any,
        locationId: 1013,
        location: {
          name: "Haven Elementary School",
        },
      },
      {
        startTimeLocal: "2019-11-18T08:30:00" as any,
        endTimeLocal: "2019-11-18T12:00:00" as any,
        locationId: 1013,
        location: {
          name: "Haven Elementary School",
        },
      },
    ],
  },
];

export const AsAdmin = () => {
  const path = AdminCreateAbsenceRoute.generate({
    organizationId: "1006",
    employeeId: "123",
  });

  const Provider = mockProvider({
    initialUrl: path,
    logMissingMocks: true,
    mocks: {
      Query: () => ({}),
    },
  });

  return (
    <Provider>
      <Route path={AdminCreateAbsenceRoute.path}>
        <EditVacancies
          employeeName="Jane Doe"
          details={formVacancyValues}
          employeeId="103"
          positionName="Math Teacher"
          onChangedVacancies={() => {}}
          onCancel={() => {}}
          setStep={() => {}}
        />
      </Route>
    </Provider>
  );
};

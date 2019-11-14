import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { CreateAbsence } from ".";
import {
  AdminCreateAbsenceRoute,
  EmployeeCreateAbsenceRoute,
} from "ui/routes/create-absence";
import { Route } from "react-router";
import { CreateAbsenceUI } from "./ui";
import { NeedsReplacement } from "graphql/server-types.gen";

export default {
  title: "Pages/Create Absence",
};

export const AsAdmin = () => {
  const path = AdminCreateAbsenceRoute.generate({
    organizationId: "1006",
    employeeId: "123",
  });
  const Provider = mockProvider({
    initialUrl: path,
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
          positionId={1}
        />
      </Route>
    </Provider>
  );
};

export const AsEmployee = () => {
  const path = EmployeeCreateAbsenceRoute.generate({ role: "employee" });
  const Provider = mockProvider({
    initialUrl: path,
    mocks: {},
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
          positionId={1}
        />
      </Route>
    </Provider>
  );
};

export const AsSubNotNeededEmployee = () => {
  const path = EmployeeCreateAbsenceRoute.generate({ role: "employee" });
  const Provider = mockProvider({
    initialUrl: path,
    mocks: {},
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
          positionId={1}
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
          byId: {
            id: "123",
            primaryPosition: {
              needsReplacement: NeedsReplacement.Yes,
            },
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
          positionId={1}
        />
      </Route>
    </Provider>
  );
};

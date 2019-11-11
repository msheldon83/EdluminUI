import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { CreateAbsence } from ".";
import {
  AdminCreateAbsenceRoute,
  EmployeeCreateAbsenceRoute,
} from "ui/routes/create-absence";
import { Route } from "react-router";
import { CreateAbsenceUI } from "./ui";

export default {
  title: "Pages/Create Absence",
};

export const SelectEmployee = () => {
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
        <CreateAbsence />
      </Route>
    </Provider>
  );
};

export const AsEmployee = () => {
  const path = EmployeeCreateAbsenceRoute.generate({ role: "employee" });
  const Provider = mockProvider({
    initialUrl: path,
  });
  return (
    <Provider>
      <Route path={EmployeeCreateAbsenceRoute.path}>
        <CreateAbsenceUI actingAsEmployeeId="123" organizationId="124" />
      </Route>
    </Provider>
  );
};

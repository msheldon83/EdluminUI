import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { AdminCreateAbsenceRoute } from "ui/routes/create-absence";
import { Confirmation } from "./confirmation";

export default {
  title: "Pages/Create Absence/Confirmation",
};

export const AsAdminBasic = () => {
  const path = AdminCreateAbsenceRoute.generate({
    organizationId: "1006",
    employeeId: "123",
  });
  const Provider = mockProvider({
    initialUrl: path,
    mocks: {},
  });
  return (
    <Provider>
      <Confirmation absenceId={"123456789"} dispatch={() => {}} />
    </Provider>
  );
};

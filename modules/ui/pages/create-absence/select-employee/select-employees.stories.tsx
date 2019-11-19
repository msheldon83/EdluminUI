import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { AdminSelectEmployeeForCreateAbsenceRoute } from "ui/routes/create-absence";
import { Route } from "react-router";
import { SelectEmployee } from ".";

export default {
  title: "Pages/Create Absence/Select Employee",
};

export const List: React.FC = props => {
  const Provider = mockProvider({
    initialUrl: AdminSelectEmployeeForCreateAbsenceRoute.generate({
      organizationId: "123",
    }),
  });

  return (
    <Provider>
      <Route path={AdminSelectEmployeeForCreateAbsenceRoute.path}>
        <SelectEmployee />
      </Route>
    </Provider>
  );
};

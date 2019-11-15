import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { AssignSub } from "./assign-sub";
import { Qualified, Available } from "graphql/server-types.gen";

export default {
  title: "Pages/Create Absence/Assign Sub",
};

export const BasicAssignSub = () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        absence: () => ({
          replacementEmployeesForVacancy: {
            totalCount: 25,
            results: [
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
              },
            ],
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

BasicAssignSub.story = {
  name: "Basic Assign Sub",
};

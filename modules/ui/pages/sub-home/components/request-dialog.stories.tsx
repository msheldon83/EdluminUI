import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { RequestAbsenceDialog } from "./request-dialog";

export default {
  title: "Pages/Sub Home/AcceptDialog",
};

export const Assigned = () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        vacancy: () => ({
          wasEmployeeAssignedToJob: () => ({
            assignmentId: 100457,
            description: "Some Desctription",
            employeeId: 1000,
            employeeWasAssigned: true,
            returnCode: 0,
            vacancyId: 1000,
          }),
        }),
      }),
    },
  });

  return (
    <Provider>
      <RequestAbsenceDialog
        open={true}
        onClose={(): any => {}}
        employeeId={"1000"}
        vacancyId={"1000"}
      />
    </Provider>
  );
};
Assigned.story = {
  name: "Employee was assigned",
};

export const NotAssigned = () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        vacancy: () => ({
          wasEmployeeAssignedToJob: () => ({
            assignmentId: null,
            description: "Employee was not assigned.",
            employeeId: 1000,
            employeeWasAssigned: false,
            returnCode: -1,
            vacancyId: 1000,
          }),
        }),
      }),
    },
  });

  return (
    <Provider>
      <RequestAbsenceDialog
        open={true}
        onClose={(): any => {}}
        employeeId={"1000"}
        vacancyId={"1000"}
      />
    </Provider>
  );
};
NotAssigned.story = {
  name: "Employee was Not assigned",
};

export const Waiting = () => {
  const Provider = mockProvider();

  return (
    <Provider>
      <RequestAbsenceDialog
        open={true}
        onClose={(): any => {}}
        employeeId={"1000"}
        vacancyId={"1000"}
      />
    </Provider>
  );
};
Waiting.story = {
  name: "Waiting for update",
};

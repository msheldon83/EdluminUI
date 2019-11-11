import * as React from "react";
import { CreateAbsenceUI } from "./ui";

type Props = {};

export const EmployeeCreateAbsence: React.FC<Props> = props => {
  /* TODO find the employee ID and organization ID and pass this in to the UI */
  return (
    <CreateAbsenceUI employeeId="xxx" actingAsEmployee organizationId="123" />
  );
};

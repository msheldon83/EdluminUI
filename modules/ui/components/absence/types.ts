import { AccountingCodeValue } from "../form/accounting-code-dropdown";

type AssignmentInfo = {
  assignmentId?: string;
  assignmentRowVersion?: string;
  assignmentStartDateTime?: string;
  assignmentEmployeeId?: string;
  assignmentEmployeeFirstName?: string;
  assignmentEmployeeLastName?: string;
  assignmentEmployeeEmail?: string;
};

export type VacancyDetail = {
  vacancyDetailId: string | undefined;
  date: string;
  startTime: string;
  endTime: string;
  locationId: string;
  locationName?: string;
  absenceStartTime?: string;
  absenceEndTime?: string;
  accountingCodeAllocations?: AccountingCodeValue | null;
  payCodeId?: string | null;
  isClosed: boolean;
} & AssignmentInfo;

export type AssignmentOnDate = {
  date: string;
} & AssignmentInfo;

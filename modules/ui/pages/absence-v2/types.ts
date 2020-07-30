import { DayPart } from "graphql/server-types.gen";
import { AccountingCodeValue } from "ui/components/form/accounting-code-dropdown";

export type AbsenceFormData = {
  details: AbsenceDetail[];
  notesToApprover?: string;
  adminOnlyNotes?: string;
  needsReplacement: boolean;
  notesToReplacement?: string;
  payCodeId?: string;
  accountingCodeAllocations?: AccountingCodeValue;
  requireNotesToApprover?: boolean;
};

export type AbsenceDetail = {
  id?: string;
  date: Date;
  dayPart?: DayPart;
  hourlyStartTime?: Date;
  hourlyEndTime?: Date;
  absenceReasonId?: string;
};

export type AssignmentOnDate = {
  startTimeLocal: Date;
  vacancyDetailId?: string | undefined;
  assignmentId?: string;
  assignmentRowVersion?: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

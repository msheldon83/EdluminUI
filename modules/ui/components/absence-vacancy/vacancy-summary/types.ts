import { AccountingCodeAllocation } from "helpers/accounting-code-allocations";

/* Something that VacancyDetail can be mapped into */
export type VacancySummaryDetail = {
  vacancyId?: string;
  vacancyDetailId: string;
  date: Date;
  startTimeLocal: Date;
  endTimeLocal: Date;
  payCodeId?: string;
  payCodeName?: string;
  locationId: string;
  locationName: string;
  accountingCodeAllocations: AccountingCodeAllocation[];
  assignment?: {
    id?: string | undefined;
    rowVersion?: string | undefined;
    employee?: Employee;
  };
  absenceStartTimeLocal?: Date;
  absenceEndTimeLocal?: Date;
};

/* When you need to keep track of what VacancyDetails are on which 
  date with which assignment */
export type VacancySummaryDetailByAssignmentAndDate = {
  assignmentId?: string;
  employeeId?: string;
  date: Date;
  startDateAndTimeLocal: Date;
  details: VacancySummaryDetail[];
};

/* Contains whether or not there is an Assignment and all of the Vacancy Details associated with that.
  An undefined "assignment" would denote an unfilled scenario. */
export type AssignmentFor = {
  assignment?: Assignment;
  vacancyDetailIds: string[];
  vacancyDetailIdsByDate: {
    date: Date;
    vacancyDetailIds: string[];
  }[];
};

/* For relevant Assignment information. If an existing Assignment, then
  both "id" and "rowVersion" would be present. If they are not, then this 
  Assignment is being prearranged for the specified Employee and has not been created yet. */
export type Assignment = {
  id?: string;
  rowVersion?: string;
  employee?: Employee;
};

/* Assignment information that applies to a set of dates and specific shared details across those dates */
export type AssignmentWithDetails = AssignmentFor & DateDetails;

/* Specific date information and shared details on those dates */
export type DateDetails = {
  dates: Date[];
  startDateAndTimeLocal: Date;
  details: DateDetail[];
  absenceStartTime?: string;
  absenceEndTime?: string;
};

/* Details that can be shared across dates and are used to determine if 2 dates are esssentially the same */
export type DateDetail = {
  startTime: string;
  endTime: string;
  locationId: string;
  locationName: string;
  payCodeId?: string;
  payCodeName?: string;
  accountingCodeAllocations?: AccountingCodeAllocation[];
};

/* LOCAL TYPES */
type Employee = {
  id: string;
  firstName: string;
  lastName: string;
};

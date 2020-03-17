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
    id?: string;
    rowVersion?: string;
    employee: Employee;
  };
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
};

type AccountingCodeAllocation = {
  accountingCodeId: string;
  accountingCodeName: string;
  allocation: number;
};

export type AssignmentFor = {
  assignment?: Assignment;
  vacancyDetailIds: string[];
};

export type Assignment = {
  id?: string;
  rowVersion?: string;
  employee: Employee;
};

export type AssignmentWithDetails = AssignmentFor & {
  dates: Date[];
} & AssignmentDetail;

export type AssignmentDetail = {
  startTime: string;
  endTime: string;
  locationId: string;
  locationName: string;
  payCodeId?: string;
  payCodeName?: string;
  accountingCodeAllocations?: AccountingCodeAllocation[];
};

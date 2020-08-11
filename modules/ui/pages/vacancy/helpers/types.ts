import { AccountingCodeAllocation } from "helpers/accounting-code-allocations";

export type VacancyDayPart = {
  id: "full" | "halfDayAM" | "halfDayPM" | "custom";
  label: string;
  start?: number | undefined;
  end?: number | undefined;
};

export type VacancyDetailsFormData = {
  id: string;
  positionTypeId: string;
  title: string;
  contractId: string;
  locationId: string;
  locationName: string;
  workDayScheduleId: string;
  notesToReplacement?: string | null;
  adminOnlyNotes?: string | null;
  isClosed: boolean;
  details: VacancyDetailItem[];
  closedDetails: VacancyDetailItem[];
  ignoreWarnings?: boolean;
  orgId: string;
  rowVersion: string;
};

export type VacancyDetailItem = {
  id: string | undefined;
  isClosed: boolean;
  saved?: boolean;
  date: Date;
  startTime: number;
  endTime: number;
  locationId: string;
  payCodeId?: string;
  payCodeName?: string;
  accountingCodeAllocations?: AccountingCodeAllocation[];
  vacancyReasonId: string;
  assignment?: {
    id?: string;
    rowVersion?: string;
    employee?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string | undefined;
    };
  };
};

export type VacancyFormValues = {
  id?: string;
  positionTypeId: string;
  title: string;
  contractId: string;
  locationId: string;
  locationName: string;
  workDayScheduleId: string;
  notesToReplacement?: string | null;
  adminOnlyNotes?: string | null;
  details: VacancyDetailItem[];
};

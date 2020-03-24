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
  details: VacancyDetailItem[];
  ignoreWarnings?: boolean;
  orgId: string;
  rowVersion: string;
};

export type VacancyDetailItem = {
  id: string | undefined;
  saved?: boolean;
  date: Date;
  startTime: number;
  endTime: number;
  locationId: string;
  payCodeId?: string;
  payCodeName?: string;
  accountingCodeAllocations?: {
    accountingCodeId: string;
    accountingCodeName: string;
    allocation: number;
  }[];
  vacancyReasonId: string;
  assignment?: {
    id?: string;
    rowVersion?: string;
    employee?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
};

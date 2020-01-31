export type VacancyDetail = {
  date: string;
  startTime: string;
  endTime: string;
  locationId: string;
  locationName?: string;
  absenceStartTime?: string;
  absenceEndTime?: string;
  //accountingCodeAllocations: string[];
  //accountingCodeAllocationNames?: string[];
  payCodeName?: string;
  payCodeId: string;
};

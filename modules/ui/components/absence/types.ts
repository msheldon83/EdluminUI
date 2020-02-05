export type VacancyDetail = {
  date: string;
  startTime: string;
  endTime: string;
  locationId: string;
  locationName?: string;
  absenceStartTime?: string;
  absenceEndTime?: string;
  accountingCodeId?: string | null;
  payCodeId?: string | null;
};

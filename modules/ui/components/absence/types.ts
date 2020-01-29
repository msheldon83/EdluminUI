export type VacancyDetail = {
  date: string;
  startTime: string;
  endTime: string;
  locationId: number;
  locationName?: string;
  absenceStartTime?: string;
  absenceEndTime?: string;
  accountingCode?: number;
  payCodeId?: number;
};

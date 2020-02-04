export type VacancyDetail = {
  vacancyDetailId: string | undefined;
  date: string;
  startTime: string;
  endTime: string;
  locationId: string;
  locationName?: string;
  absenceStartTime?: string;
  absenceEndTime?: string;
  assignmentId?: string;
  assignmentEmployeeId?: string;
  assignmentEmployeeName?: string;
};

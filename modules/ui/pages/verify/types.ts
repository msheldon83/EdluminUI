import { VacancyDetail } from "graphql/server-types.gen";

export type DayRow = {
  date: Date;
  verifiedAssignments: number;
  totalAssignments: number;
};

export type AssignmentDetail = Pick<
  VacancyDetail,
  | "id"
  | "orgId"
  | "startTimeLocal"
  | "startDate"
  | "endTimeLocal"
  | "assignment"
  | "payCode"
  | "location"
  | "vacancy"
  | "dayPortion"
  | "totalDayPortion"
  | "accountingCodeAllocations"
  | "verifyComments"
  | "verifiedAtLocal"
  | "payDurationOverride"
  | "actualDuration"
  | "payInfo"
  | "vacancyReason"
>;
// adminOnlyNotes live on absence and vacancies; must grab them separately for vacancies.

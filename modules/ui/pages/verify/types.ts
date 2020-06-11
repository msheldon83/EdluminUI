export type DayRow = {
  date: Date;
  verifiedAssignments: number;
  totalAssignments: number;
};

export type AssignmentRow = {
  id: string;
  subName: string;
  subFor: string;
  reason: string;
  startTime: string;
  endTime: string;
  payDuration?: string;
  position: string;
  payCode?: { id: string; name: string };
  school: string;
  accountingCode?: { id: string; name: string };
  adminComments: string;
  isVerified: boolean;
  // Notes to the administrator are only on the absence object.
  // Have to look them up separately for vacancies.
} & ({ vacancyId: string } | { absenceId: string; notesToAdmin: string });

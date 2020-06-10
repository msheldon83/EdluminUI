export type DayRow = {
  date: Date;
  verifiedAssignments: number;
  totalAssignments: number;
};

export type AssignmentRow = {
  id: string;
  subName: string;
  employeeName: string;
  absenceReason: string;
  time: string;
  pay: string;
  position: string;
  code: string;
  school: string;
  acct: string;
  notesToAdmin: string;
  adminComments: string;
};

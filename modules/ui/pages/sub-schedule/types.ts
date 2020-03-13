export type AssignmentVacancyDetails = {
  id?: string;
  assignment: {
    id: string;
    rowVersion: string;
    startTimeLocal?: string;
    endTimeLocal?: string;
  } | null;
  startDate?: string;
  endDate?: string;
  startTimeLocal?: string;
  endTimeLocal?: string;
  dayPortion: number;
  vacancyReason?: {
    id?: string;
    name?: string;
  };
  location: {
    name?: string;
  } | null;
  payInfo?: { label?: string | null } | null;
  vacancy: {
    id: string;
    payInfoSummary?: { summaryLabel?: string | null } | null;
    notesToReplacement?: string | null;
    organization: { name?: string };
    position: {
      title?: string;
    } | null;
    absence: {
      id: string;
      employee: {
        firstName: string;
        lastName: string;
      } | null;
    } | null;
  } | null;
};

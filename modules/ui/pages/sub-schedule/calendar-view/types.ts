export type AssignmentVacancyDetails = {
  id?: string;
  assignment: {
    id: string;
    startTimeLocal?: string;
    endTimeLocal?: string;
  } | null;
  startDate?: string;
  endDate?: string;
  startTimeLocal?: string;
  endTimeLocal?: string;
  dayPortion: number;
  location: {
    name?: string;
  } | null;
  vacancy: {
    notesToReplacement?: string;
    organization: { name?: string };
    position: {
      name?: string;
    } | null;
    absence: {
      employee: {
        firstName: string;
        lastName: string;
      } | null;
    } | null;
  } | null;
};
export type VacancyDayPart = {
  id: "full" | "halfDayAM" | "halfDayPM" | "custom";
  label: string;
  start?: number;
  end?: number;
};

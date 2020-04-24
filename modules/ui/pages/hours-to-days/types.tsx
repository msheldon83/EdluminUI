export type DayConversion = {
  maxMinutes: number;
  name: string;
  dayEquivalent: number;
};

export type HoursToDaysData = {
  conversions: Partial<DayConversion>[];
  catchAll: Partial<DayConversion>;
};

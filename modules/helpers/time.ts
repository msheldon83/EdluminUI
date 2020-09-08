import { getHours, getMinutes, format, parseISO } from "date-fns";

const padTime = (time: number) => {
  const timeAsString = `${time}`;
  return timeAsString.length === 2 ? timeAsString : `0${timeAsString}`;
};

const isPm = (hours: number) => hours > 11;

const formatHours = (hours: number) => {
  const formattedHours = hours > 12 ? hours - 12 : hours;

  return formattedHours === 0 ? 12 : formattedHours;
};

export const humanizeTimeStamp = (time: number): string => {
  const date = new Date(time);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const amPm = isPm(hours) ? "pm" : "am";

  const formattedHours = formatHours(hours);
  const formattedTime = `${formattedHours}:${padTime(minutes)} ${amPm}`;

  return formattedTime;
};

const ISO_REGEX = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
export const isIso = (time: any) => ISO_REGEX.test(time);

export const timeStampToIso = (time: number): string =>
  new Date(time).toISOString();
export const isoToTimestamp = (iso: string): number => Date.parse(iso);

export const secondsSinceMidnight = (time: string | number): number => {
  const currentTime = new Date(time);
  const hours = getHours(currentTime);
  const hoursInSeconds = hours * 60 * 60;
  const minutes = getMinutes(currentTime);
  const minutesInSeconds = minutes * 60;
  const seconds = hoursInSeconds + minutesInSeconds;
  return seconds;
};

export const secondsAppliedToToday = (
  seconds: number,
  overrideDate?: Date
): Date => {
  const hours = Math.floor(seconds / 60 / 60);
  const minutes = Math.floor((seconds - hours * 60 * 60) / 60);
  const secondsForTodayDate = overrideDate ? overrideDate : new Date();
  secondsForTodayDate.setHours(hours, minutes, 0, 0);
  return secondsForTodayDate;
};

export const secondsToIsoString = (seconds: number): string => {
  const date = secondsAppliedToToday(seconds);
  const timeStamp = timeStampToIso(date.getTime());
  return timeStamp;
};

export const secondsToFormattedHourMinuteString = (seconds: number): string => {
  const date = secondsAppliedToToday(seconds);
  const formattedDate = format(date, "h:mm a");
  return formattedDate;
};

/*
  This algorithm is a bunch of ideas I found from libraries and aroudn the internet
  to correctly parse common time inputs.

  Here is an example of it working:

  https://jsbin.com/goxukajika/4/edit?js,console,output
*/

export const parseTimeFromString = (
  time: string,
  earliestTime?: string,
  dateString?: string
): number => {
  let hour = 0;
  let minute = 0;
  let pmFromInput = /p/i.exec(time) !== null;
  const amFromInput = /a/i.exec(time) !== null;
  const periodDefined = amFromInput || pmFromInput;
  const num = time.replace(/[^0-9]/g, "");

  // The very earliest time stamp we would accept if "earliestTime" is not provided
  const midnightTime = new Date();
  midnightTime.setHours(0, 0, 0, 0);

  const earliestTimesamp = earliestTime
    ? parseTimeFromString(humanizeTimeStamp(isoToTimestamp(earliestTime)))
    : midnightTime.getTime();
  const earliest = new Date(earliestTimesamp);
  const earliestHour = earliest.getHours();
  const earliestMinutes = earliest.getMinutes();

  // Parse for hour and minute
  switch (num.length) {
    case 4:
      hour = parseInt(num[0] + num[1], 10);
      minute = parseInt(num[2] + num[3], 10);
      break;
    case 3:
      hour = parseInt(num[0], 10);
      minute = parseInt(num[1] + num[2], 10);
      break;
    case 2:
    case 1:
      hour = parseInt(num[0] + (num[1] || ""), 10);
      minute = 0;
      break;
    default:
      hour = 12;
      minute = 0;
  }

  // Make sure hour is in 24 hour format
  if (pmFromInput === true && hour > 0 && hour < 12) {
    hour = hour + 12;
  }

  // Force pm for hours between 13:00 and 23:00
  if (hour >= 13 && hour <= 23) {
    pmFromInput = true;
  }

  // Keep hours within range
  if (hour <= 0 || hour >= 24 || (hour === 12 && !pmFromInput)) {
    hour = 0;
  }

  // Keep minutes within range
  if (minute < 0 || minute > 59) {
    minute = 0;
  }

  const date =
    dateString && isIso(dateString) ? parseISO(dateString) : new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(0);
  date.setMilliseconds(0);

  /*
  When there is no am or pm for in the input, assume a am or pm based off of the
  earliestTime
  */
  if (!periodDefined && hour < earliestHour) {
    date.setHours(hour + 12);
    date.setMinutes(earliestMinutes);
  }

  // Minimum hour based off of earliest possible time given
  date.setHours(Math.max(date.getHours(), earliestHour));

  // Only check the minutes if the hours are the same
  date.setMinutes(
    date.getHours() === earliestHour
      ? Math.max(minute, earliestMinutes)
      : minute
  );

  return date.getTime();
};

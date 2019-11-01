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

export const midnightTime = (): number => {
  const startTime = new Date();
  startTime.setHours(0, 0, 0, 0);
  return startTime.getTime();
};

/*
  This algorithm is a bunch of ideas I found from libraries and aroudn the internet
  to correctly parse common time inputs.

  Here is an example of it working:

  https://jsbin.com/goxukajika/4/edit?js,console,output
*/

export const parseTimeFromString = (time: string): number => {
  let hour = 0;
  let minute = 0;
  let pm = time?.match(/p/i) !== null;
  const num = time?.replace(/[^0-9]/g, "");

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
  if (pm === true && hour > 0 && hour < 12) {
    hour = hour + 12;
  }

  // Force pm for hours between 13:00 and 23:00
  if (hour >= 13 && hour <= 23) {
    pm = true;
  }

  // Keep within range
  if (hour <= 0 || hour >= 24 || (hour === 12 && !pm)) {
    hour = 0;
  }

  if (minute < 0 || minute > 59) {
    minute = 0;
  }

  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(0);

  return date.getTime();
};

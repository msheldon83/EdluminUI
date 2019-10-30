/*
  This algorithm is a bunch of ideas I found from libraries and aroudn the internet
  to correctly parse common time inputs.

  Here is an example of it working:

  https://jsbin.com/goxukajika/4/edit?js,console,output
*/

const padTime = (time: string | number) =>
  `${time}`.length > 1 ? `${time}` : `0${time}`;

export const parseTime = (time: string) => {
  let hour = 0;
  let minute = 0;
  let pm = time.match(/p/i) !== null;
  const num = time.replace(/[^0-9]/g, "");

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

  return `${padTime(hour)}${padTime(minute)}`;
};

const padTime = (time: number) => {
  const timeAsString = `${time}`;
  return timeAsString.length === 2 ? timeAsString : `0${timeAsString}`;
};

const isPm = (hours: number) => hours > 11;

const formatHours = (hours: number) => {
  const formattedHours = hours > 12 ? hours - 12 : hours;

  return formattedHours === 0 ? 12 : formattedHours;
};

export const humanizeTimeStamp = (time: number) => {
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

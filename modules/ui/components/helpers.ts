import * as i18next from "i18next";

type Props = {
  firstName?: string;
  lastName?: string;
};

export const getInitials = (props: Props) => {
  const { firstName, lastName } = props;

  return `${firstName ? firstName.substr(0, 1) : ""}${
    lastName ? lastName.substr(0, 1) : ""
  }`;
};

export const minutesToHours = (mins?: number, decimalPlaces = 2) => {
  if (!mins) {
    return null;
  }

  const hours = +(mins / 60).toFixed(decimalPlaces);
  return hours;
};

export const hoursToMinutes = (hours?: number) => {
  if (!hours) {
    return null;
  }

  const mins = hours * 60;
  return mins;
};

export const boolToDisplay = (t: i18next.TFunction, bool?: boolean | null) => {
  return bool ? t("Yes") : t("No");
};

export const parseDayPortion = (t: i18next.TFunction, dayPortion: number) => {
  if (dayPortion < 0.5) {
    return t("Partial day (hourly)");
  } else if (dayPortion === 0.5) {
    return t("Half day");
  } else if (dayPortion > 0.5 && dayPortion < 2) {
    return t("Full day");
  } else {
    return t("Full days");
  }
};

export const getBeginningOfSchoolYear = (date: Date) => {
  // School years are defined as july to june
  const july = 6; /* months start at 0 in js dates */
  let year = date.getFullYear();
  if (date.getMonth() < july) {
    year -= 1;
  }
  return new Date(year, july);
};

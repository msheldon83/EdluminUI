import i18next = require("i18next");

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

export const boolToDisplay = (t: i18next.TFunction, bool?: boolean | null) => {
  return bool ? t("Yes") : t("No");
};

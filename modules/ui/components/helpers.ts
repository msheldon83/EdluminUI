import * as i18next from "i18next";
import { AbsenceReasonTrackingTypeId } from "graphql/server-types.gen";

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

export const getBeginningOfSchoolYear = (date: Date) => {
  // School years are defined as july to june
  const july = 6; /* months start at 0 in js dates */
  let year = date.getFullYear();
  if (date.getMonth() < july) {
    year -= 1;
  }
  return new Date(year, july);
};

export const getPayLabel = (
  match: boolean,
  payTypeId: AbsenceReasonTrackingTypeId,
  initialLabel: string,
  dayPortion: number,
  totalDayPortion: number,
  t: i18next.TFunction
) => {
  if (match || payTypeId === AbsenceReasonTrackingTypeId.Hourly) {
    return initialLabel;
  }
  const daysInfo =
    dayPortion === totalDayPortion
      ? initialLabel
      : `${dayPortion.toFixed(1)}/${totalDayPortion.toFixed(1)}`;
  return `${daysInfo} ${totalDayPortion > 1 ? t("Days") : t("Day")}`;
};

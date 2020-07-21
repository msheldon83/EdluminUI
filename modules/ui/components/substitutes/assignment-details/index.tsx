import * as React from "react";
import { useMemo } from "react";
import { AssignmentDetailsUI } from "./assignment-details-ui";
import { compact, groupBy } from "lodash-es";
import { formatIsoDateIfPossible } from "helpers/date";
import { useTranslation } from "react-i18next";

type Detail = {
  startTimeLocal?: string | null;
  endTimeLocal?: string | null;
  location?: {
    name: string | null;
  } | null;
  vacancyReason?: {
    id: string | null;
    name: string | null;
  } | null;
} | null;

type AssignmentVacancy = {
  organization: {
    id: string;
    name: string;
  };
  position?: {
    title: string;
  } | null;
  absence?: {
    employee?: {
      firstName: string;
      lastName: string;
    } | null;
  } | null;
  totalDayPortion: number;
  payInfoSummary?: { summaryLabel: string } | null;
  // unfortunate that we have anys here.
  startTimeLocal?: any;
  endTimeLocal?: any;
  startDate?: any;
  endDate?: any;
  details?: Detail[] | null;
};

type Props = {
  vacancy: AssignmentVacancy;
  isFavorite?: boolean;
};

export const AssignmentDetails: React.FC<Props> = props => {
  const { vacancy } = props;
  const { t } = useTranslation();

  const employeeName =
    vacancy.details && vacancy.details[0]?.vacancyReason
      ? `${t("Vacancy")}`
      : `${vacancy.absence!.employee!.firstName} ${
          vacancy.absence!.employee!.lastName
        }`;

  const locationNames = useMemo(
    () => compact(vacancy.details!.map(d => d!.location!.name)),
    [vacancy.details]
  );

  const multipleStarts =
    Object.entries(
      groupBy(props.vacancy.details, a =>
        formatIsoDateIfPossible(a!.startTimeLocal, "h:mm aaa")
      )
    ).length > 1;
  const multipleEndTimes =
    Object.entries(
      groupBy(props.vacancy.details, a =>
        formatIsoDateIfPossible(a!.endTimeLocal, "h:mm aaa")
      )
    ).length > 1;
  const multipleTimes = multipleStarts && multipleEndTimes;

  const times = multipleTimes
    ? { multipleTimes }
    : {
        multipleTimes,
        endTime: vacancy.endTimeLocal,
      };

  return (
    <AssignmentDetailsUI
      {...times}
      employeeName={employeeName}
      organizationName={vacancy.organization.name}
      startTime={vacancy.startTimeLocal}
      dayPortion={vacancy.totalDayPortion}
      payInfoLabel={vacancy.payInfoSummary?.summaryLabel ?? ""}
      startDate={vacancy.startDate}
      endDate={vacancy.endDate}
      locationNames={locationNames}
      positionName={vacancy.position?.title ?? ""}
    />
  );
};

import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { getDateRangeDisplayText, convertStringToDate } from "helpers/date";
import { DeletedData } from "ui/components/deleted-data";
import { GetDeleteVacancyInfo } from "./graphql/get-deleted-vacancy-info.gen";
import { NotFound } from "../not-found";

type Props = {
  vacancyId: string;
};

export const DeletedVacancyInfo: React.FC<Props> = props => {
  const { t } = useTranslation();

  const getDeleteVacancyInfo = useQueryBundle(GetDeleteVacancyInfo, {
    variables: {
      vacancyId: props.vacancyId,
    },
  });

  if (
    getDeleteVacancyInfo.state !== "DONE" &&
    getDeleteVacancyInfo.state !== "UPDATING"
  ) {
    return <></>;
  }

  const deletedVacancy = getDeleteVacancyInfo.data.vacancy?.deletedVacancyInfo;
  if (!deletedVacancy) {
    return <NotFound />;
  }

  const formattedDate = getDateRangeDisplayText(
    deletedVacancy?.vacancyLocalStartTime
      ? convertStringToDate(deletedVacancy?.vacancyLocalStartTime)
      : null,
    deletedVacancy?.vacancyLocalStartTime
      ? convertStringToDate(deletedVacancy?.vacancyLocalEndTime)
      : null
  );

  const message = t(
    `This vacancy, originally scheduled for ${formattedDate} at ${deletedVacancy?.locationName} has been deleted`
  );
  const subHeader = deletedVacancy?.positionTitle ?? "";
  const header = `${t("Vacancy #")}${deletedVacancy?.id}`;

  return (
    <DeletedData message={message} header={header} subHeader={subHeader} />
  );
};

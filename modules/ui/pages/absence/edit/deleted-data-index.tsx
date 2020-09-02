import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { getDateRangeDisplayText, convertStringToDate } from "helpers/date";
import { DeletedData } from "ui/components/deleted-data";
import { NotFound } from "ui/pages/not-found";
import { GetDeleteAbsenceInfo } from "../graphql/get-deleted-absence-info.gen";

type Props = {
  absenceId: string;
};

export const DeletedDataIndex: React.FC<Props> = props => {
  const { t } = useTranslation();

  const getDeletedAbsence = useQueryBundle(GetDeleteAbsenceInfo, {
    variables: {
      absenceId: props.absenceId,
    },
  });

  if (
    getDeletedAbsence.state !== "DONE" &&
    getDeletedAbsence.state !== "UPDATING"
  ) {
    return <></>;
  }

  const deletedAbsence = getDeletedAbsence.data.absence?.deletedAbsenceInfo;
  if (!deletedAbsence) {
    return <NotFound />;
  }

  const formattedDate = getDateRangeDisplayText(
    deletedAbsence?.absenceLocalStartTime
      ? convertStringToDate(deletedAbsence?.absenceLocalStartTime)
      : null,
    deletedAbsence?.absenceLocalEndTime
      ? convertStringToDate(deletedAbsence?.absenceLocalEndTime)
      : null
  );

  const message = t(
    `This absence, originally scheduled for ${formattedDate}, has been removed.`
  );
  const subHeader = `${deletedAbsence?.firstName} ${deletedAbsence?.lastName}`;
  const header = `${t("Absence #")}${deletedAbsence?.id}`;

  return (
    <DeletedData message={message} header={header} subHeader={subHeader} />
  );
};

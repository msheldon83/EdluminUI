import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";

import { DeletedData } from "ui/components/deleted-data";
import { GetDeleteAbsenceInfo } from "./graphql/get-deleted-absence-info.gen";

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

  console.log(deletedAbsence);

  const message = t("The absence originally scheduled for");
  const header = deletedAbsence?.firstName + " " + deletedAbsence?.lastName;
  const subHeader = t("Absence ") + deletedAbsence?.id;

  return (
    <DeletedData message={message} header={header} subHeader={subHeader} />
  );
};

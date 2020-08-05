import * as React from "react";
import { useTranslation } from "react-i18next";
import { Absence } from "graphql/server-types.gen";
import { useQueryBundle } from "graphql/hooks";
import { GetAbsence } from "../graphql/get-absence.gen";
import { EmployeeCreateAbsenceConfirmationRouteV2 } from "ui/routes/absence-v2";
import { useRouteParams } from "ui/routes/definition";
import { Confirmation } from "./confirmation";
import { PageTitle } from "ui/components/page-title";

export const EmployeeQuickAbsenceCreateConfirmationV2: React.FC<{}> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(EmployeeCreateAbsenceConfirmationRouteV2);

  const absenceQuery = useQueryBundle(GetAbsence, {
    variables: {
      id: params.absenceId,
    },
  });

  if (absenceQuery.state === "LOADING") {
    return <></>;
  }
  const absence = absenceQuery.data.absence?.byId as Absence;
  if (!absence) return <></>;

  return (
    <>
      <PageTitle title={t("Create absence")} withoutHeading />
      <Confirmation
        orgId={absence.orgId}
        absence={absence}
        actingAsEmployee={true}
      />
    </>
  );
};

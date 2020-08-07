import * as React from "react";
import { useTranslation } from "react-i18next";
import { Absence } from "graphql/server-types.gen";
import { useQueryBundle } from "graphql/hooks";
import { GetAbsence } from "../graphql/get-absence.gen";
import { EmployeeCreateAbsenceConfirmationRoute } from "ui/routes/absence";
import { useRouteParams } from "ui/routes/definition";
import { Confirmation } from "./confirmation";
import { PageTitle } from "ui/components/page-title";

export const EmployeeQuickAbsenceCreateConfirmation: React.FC<{}> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(EmployeeCreateAbsenceConfirmationRoute);

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

import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { Confirmation } from "ui/pages/create-absence/confirmation";
import { GetAbsence } from "ui/pages/edit-absence/graphql/get-absence.gen";
import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { Absence } from "graphql/server-types.gen";
import { useRouteParams } from "ui/routes/definition";
import { CreateAbsenceConfirmationRoute } from "ui/routes/create-absence";

type Props = {};

export const QuickCreateConfirmation: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(CreateAbsenceConfirmationRoute);
  const absenceQuery = useQueryBundle(GetAbsence, {
    variables: {
      id: params.absenceId,
    },
    fetchPolicy: "cache-only",
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
        absence={absence}
        orgId={absence.organization.id.toString()}
        isAdmin={false}
        disabledDates={[]}
      />
    </>
  );
};

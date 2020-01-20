import { makeStyles } from "@material-ui/styles";
import { useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { AbsenceReasonViewEditRoute } from "ui/routes/absence-reason";
import { useRouteParams } from "ui/routes/definition";
import { GetAbsenceReason } from "./graphql/get-absence-reason.gen";
import { AbsenceReasonViewEditUI } from "./view-edit-ui";

export const AbsenceReasonViewEditPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(AbsenceReasonViewEditRoute);
  const result = useQueryBundle(GetAbsenceReason, {
    fetchPolicy: "cache-and-network",
    variables: {
      absenceReasonId: params.absenceReasonId,
    },
  });
  if (result.state !== "DONE" && result.state !== "UPDATING") {
    return <></>;
  }

  const absenceReason = result.data.orgRef_AbsenceReason?.byId!;

  return (
    <>
      <AbsenceReasonViewEditUI
        rowVersion={absenceReason.rowVersion}
        name={absenceReason.name}
        externalId={absenceReason.externalId || undefined}
        description={absenceReason.description || undefined}
        allowNegativeBalance={absenceReason.allowNegativeBalance}
        expired={absenceReason.expired}
        validUntil={absenceReason.validUntil}
        isBucket={absenceReason.isBucket}
        absenceReasonTrackingTypeId={
          absenceReason.absenceReasonTrackingTypeId || undefined
        }
        id={absenceReason.id}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({}));

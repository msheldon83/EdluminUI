import { useQueryBundle } from "graphql/hooks";
import * as React from "react";
import {
  AbsenceReasonEditSettingsRoute,
  AbsenceReasonViewEditRoute,
} from "ui/routes/absence-reason";
import { useRouteParams } from "ui/routes/definition";
import { AbsenceReasonEditSettingsUI } from "./edit-settings-ui";
import { GetAbsenceReason } from "./graphql/get-absence-reason.gen";
import { useHistory } from "react-router";

type Props = {};

export const AbsenceReasonEditSettingsPage: React.FC<Props> = props => {
  const params = useRouteParams(AbsenceReasonEditSettingsRoute);
  const history = useHistory();

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
    <AbsenceReasonEditSettingsUI
      id={absenceReason.id}
      name={absenceReason.name}
      rowVersion={absenceReason.rowVersion}
      description={absenceReason.description || undefined}
      allowNegativeBalance={absenceReason.allowNegativeBalance}
      expired={absenceReason.expired}
      validUntil={absenceReason.validUntil}
      isBucket={absenceReason.isBucket}
      absenceReasonTrackingTypeId={
        absenceReason.absenceReasonTrackingTypeId || undefined
      }
      // onSubmit={() => console.log("submit")}
      // onCancel={() => {
      //   history.push(AbsenceReasonViewEditRoute.generate(params)());
      // }}
    />
  );
};

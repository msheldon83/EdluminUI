import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import {
  AbsenceReasonTrackingTypeId,
  AssignmentType,
} from "graphql/server-types.gen";
import * as React from "react";
import { useCallback } from "react";
import { useHistory } from "react-router";
import { PageHeader } from "ui/components/page-header";
import { PageTitle } from "ui/components/page-title";
import {
  AbsenceReasonEditSettingsRoute,
  AbsenceReasonViewEditRoute,
} from "ui/routes/absence-reason";
import { useRouteParams } from "ui/routes/definition";
import { AbsenceReasonSettings } from "./absence-reason-settings";
import { GetAbsenceReason } from "./graphql/get-absence-reason.gen";
import { UpdateAbsenceReason } from "./graphql/update-absence-reason.gen";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "hooks";

type Props = {};

export const AbsenceReasonEditSettingsPage: React.FC<Props> = props => {
  const params = useRouteParams(AbsenceReasonEditSettingsRoute);
  const history = useHistory();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const result = useQueryBundle(GetAbsenceReason, {
    fetchPolicy: "cache-and-network",
    variables: {
      absenceReasonId: params.absenceReasonId,
    },
  });

  const [mutation] = useMutationBundle(UpdateAbsenceReason);

  const updateAbsenceReason = useCallback(
    async (updatedValues: {
      allowNegativeBalance: boolean;
      isBucket: boolean;
      description?: string;
      absenceReasonTrackingTypeId?: AbsenceReasonTrackingTypeId;
      appliesToAssignmentTypes?: AssignmentType;
    }) => {
      if (result.state !== "DONE") {
        return;
      }
      const reason = result.data.orgRef_AbsenceReason?.byId!;
      const {
        allowNegativeBalance,
        isBucket,
        description,
        appliesToAssignmentTypes,
        absenceReasonTrackingTypeId: absenceReasonTrackingId,
      } = updatedValues;
      await mutation({
        variables: {
          absenceReason: {
            id: Number(reason.id),
            rowVersion: reason.rowVersion,
            allowNegativeBalance,
            isBucket,
            description,
            appliesToAssignmentTypes,
            absenceReasonTrackingId,
          },
        },
      });
      history.push(AbsenceReasonViewEditRoute.generate(params));
    },
    [result, history, params]
  );

  if (result.state !== "DONE" && result.state !== "UPDATING") {
    return <></>;
  }
  const absenceReason = result.data.orgRef_AbsenceReason?.byId!;

  return (
    <>
      <PageTitle title={t("Absence Reason")} withoutHeading={!isMobile} />
      <PageHeader text={absenceReason.name} label={t("Name")} />

      <AbsenceReasonSettings
        description={absenceReason.description || undefined}
        allowNegativeBalance={absenceReason.allowNegativeBalance}
        isBucket={absenceReason.isBucket}
        absenceReasonTrackingTypeId={
          absenceReason.absenceReasonTrackingTypeId || undefined
        }
        appliesToAssignmentTypes={
          absenceReason.appliesToAssignmentTypes || undefined
        }
        onSubmit={updateAbsenceReason}
        onCancel={() => {
          history.push(AbsenceReasonViewEditRoute.generate(params));
        }}
      />
    </>
  );
};

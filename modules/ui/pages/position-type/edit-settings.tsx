import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import {
  PositionTypeRoute,
  PositionTypeViewRoute,
  PositionTypeEditSettingsRoute,
} from "ui/routes/position-type";
import { useRouteParams } from "ui/routes/definition";
import { useHistory, Redirect } from "react-router";
import { Settings } from "./components/add-edit-settings";
import {
  NeedsReplacement,
  PositionTypeUpdateInput,
  AbsenceReasonTrackingTypeId,
} from "graphql/server-types.gen";
import { UpdatePositionType } from "./graphql/update-position-type.gen";
import { GetPositionTypeById } from "./graphql/position-type.gen";

export const PositionTypeEditSettingsPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(PositionTypeEditSettingsRoute);

  const [updatePositionType] = useMutationBundle(UpdatePositionType);
  const getPositionType = useQueryBundle(GetPositionTypeById, {
    variables: { id: params.positionTypeId },
  });

  if (getPositionType.state === "LOADING") {
    return <></>;
  }

  const positionType = getPositionType?.data?.positionType?.byId;
  if (!positionType) {
    // Redirect the User back to the List page
    const listUrl = PositionTypeRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  const getViewUrl = () => {
    const viewParams = {
      ...params,
      positionTypeId: positionType.id,
    };
    return PositionTypeViewRoute.generate(viewParams);
  };

  const update = async (positionTypeSettings: PositionTypeUpdateInput) => {
    await updatePositionType({
      variables: {
        positionType: {
          ...positionTypeSettings,
          rowVersion: positionType.rowVersion,
        },
      },
    });
  };

  return (
    <>
      <PageTitle title={positionType.name} />
      <Settings
        orgId={params.organizationId}
        positionType={positionType}
        submitText={t("Save")}
        onSubmit={async (
          forPermanentPositions: boolean,
          needsReplacement: NeedsReplacement | undefined | null,
          forStaffAugmentation: boolean,
          minAbsenceDurationMinutes: number,
          payTypeId: AbsenceReasonTrackingTypeId | undefined | null,
          defaultContractId?: number | null
        ) => {
          const positionTypeSettings: PositionTypeUpdateInput = {
            id: Number(positionType.id),
            rowVersion: positionType.rowVersion,
            forPermanentPositions: forPermanentPositions,
            needsReplacement: needsReplacement,
            forStaffAugmentation: forStaffAugmentation,
            minAbsenceDurationMinutes: minAbsenceDurationMinutes,
            defaultContractId: defaultContractId,
            payTypeId: payTypeId,
          };

          // Update the Position Type
          await update(positionTypeSettings);
          // Go back to the Position Type View page
          history.push(getViewUrl());
        }}
        onCancel={() => {
          // Go back to the Position Type View page
          history.push(getViewUrl());
        }}
      />
    </>
  );
};

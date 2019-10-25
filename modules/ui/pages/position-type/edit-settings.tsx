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
} from "graphql/server-types.gen";
import { UpdatePositionTypeSettings } from "./graphql/update-settings.gen";
import { GetPositionTypeById } from "./graphql/position-type.gen";

export const PositionTypeEditSettingsPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(PositionTypeEditSettingsRoute);

  const [updatePositionType] = useMutationBundle(UpdatePositionTypeSettings);
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
          rowVersion: positionType.rowVersion
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
          needsReplacement: NeedsReplacement,
          forStaffAugmentation: boolean,
          minAbsenceDurationMinutes: number,
          defaultContractId: number
        ) => {
          const positionTypeSettings: PositionTypeUpdateInput = {
            positionTypeId: Number(positionType.id),
            forPermanentPositions: forPermanentPositions,
            needsReplacement: needsReplacement,
            forStaffAugmentation: forStaffAugmentation,
            minAbsenceDurationMinutes: minAbsenceDurationMinutes,
            defaultContractId: defaultContractId,
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

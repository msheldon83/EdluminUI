import { useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import {
  PositionTypeRoute,
  PositionTypeAddRoute,
  PositionTypeViewRoute,
} from "ui/routes/position-type";
import { useRouteParams } from "ui/routes/definition";
import { AddBasicInfo } from "./components/add-basic-info";
import { useHistory } from "react-router";
import { Settings } from "./components/add-edit-settings";
import {
  NeedsReplacement,
  PositionTypeCreateInput,
} from "graphql/server-types.gen";
import { CreatePositionType } from "./graphql/create.gen";
import { TabbedHeader as Tabs, Step } from "ui/components/tabbed-header";

export const PositionTypeAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(PositionTypeAddRoute);
  const [createPositionType] = useMutationBundle(CreatePositionType);

  const [positionType, setPositionType] = React.useState<
    PositionTypeCreateInput
  >({
    orgId: Number(params.organizationId),
    name: "",
    externalId: null,
    forPermanentPositions: true,
    needsReplacement: NeedsReplacement.Yes,
    forStaffAugmentation: true,
    minAbsenceDurationMinutes: 15,
    defaultContractId: null,
  });

  const renderBasicInfoStep = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <AddBasicInfo
        positionType={positionType}
        onSubmit={(name, externalId) => {
          setPositionType({
            ...positionType,
            name: name,
            externalId: externalId,
          });
          setStep(steps[1].stepNumber);
        }}
        onCancel={() => {
          const url = PositionTypeRoute.generate(params);
          history.push(url);
        }}
      />
    );
  };

  const renderSettings = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <Settings
        orgId={params.organizationId}
        positionType={positionType}
        submitText={t("Save")}
        onSubmit={async (
          forPermanentPositions: boolean,
          needsReplacement?: NeedsReplacement | undefined | null,
          forStaffAugmentation: boolean,
          minAbsenceDurationMinutes: number,
          defaultContractId?: number | null | undefined
        ) => {
          const newPositionType = {
            ...positionType,
            forPermanentPositions: forPermanentPositions,
            needsReplacement: needsReplacement,
            forStaffAugmentation: forStaffAugmentation,
            minAbsenceDurationMinutes: minAbsenceDurationMinutes,
            defaultContractId: defaultContractId,
          };
          setPositionType(newPositionType);

          // Create the Position Type
          const id = await create(newPositionType);
          const viewParams = {
            ...params,
            positionTypeId: id!,
          };
          // Go to the Position Type View page
          history.push(PositionTypeViewRoute.generate(viewParams));
        }}
        onCancel={() => {
          const url = PositionTypeRoute.generate(params);
          history.push(url);
        }}
      />
    );
  };

  const create = async (positionType: PositionTypeCreateInput) => {
    const result = await createPositionType({
      variables: {
        positionType,
      },
    });
    return result?.data?.positionType?.create?.id;
  };

  const steps: Array<Step> = [
    {
      stepNumber: 0,
      name: t("Basic Info"),
      content: renderBasicInfoStep,
    },
    {
      stepNumber: 1,
      name: t("Settings"),
      content: renderSettings,
    },
  ];

  return (
    <>
      <PageTitle title={t("Create new position type")} />
      <Tabs steps={steps} isWizard={true}></Tabs>
    </>
  );
};

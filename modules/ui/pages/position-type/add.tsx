import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "hooks";
import { makeStyles, Tabs, Tab, Paper, Button } from "@material-ui/core";
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
import { CreatePositionType } from "./graphql/create-position-type.gen";
import { oc } from "ts-optchain";

type Step = {
  stepNumber: number;
  name: string;
};

export const PositionTypeAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";
  const history = useHistory();
  const params = useRouteParams(PositionTypeAddRoute);
  const [createPositionType] = useMutationBundle(CreatePositionType);

  const [positionType, setPositionType] = React.useState({
    orgId: Number(params.organizationId),
    name: "",
    externalId: "",
    forPermanentPositions: true,
    needsReplacement: NeedsReplacement.Yes,
    forStaffAugmentation: true,
    minAbsenceDurationMinutes: 15,
  });

  const steps: Array<Step> = [
    {
      stepNumber: 0,
      name: t("Basic Info"),
    },
    {
      stepNumber: 1,
      name: t("Settings"),
    },
    // {
    //   stepNumber: 2,
    //   name: t("Replacement"),
    // },
    // {
    //   stepNumber: 3,
    //   name: t("Substitute"),
    // },
  ];
  const [step, setStep] = React.useState(steps[0].stepNumber);
  const handleStepChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    // Allow someone to go back a tab, but not forward
    if (newValue < step) {
      setStep(newValue);
    }
  };

  const tabs = () => {
    return (
      <Paper square>
        <Tabs
          value={step}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleStepChange}
        >
          {steps.map((s, i) => (
            <Tab key={i} label={`${s.stepNumber + 1}. ${s.name}`} />
          ))}
        </Tabs>
      </Paper>
    );
  };

  const generateUrl = (step: number) => {
    const routeUrl = PositionTypeAddRoute.generate(params);
    const nextStepurl = `${routeUrl}/${step}`;
    return nextStepurl;
  };

  const renderBasicInfoStep = () => {
    return (
      <AddBasicInfo
        positionType={positionType}
        onSubmit={(name: string, externalId: string) => {
          setPositionType({
            ...positionType,
            name: name,
            externalId: externalId,
          });
          setStep(step + 1);
          // Update the URL to the next step
          //history.push(generateUrl(steps.settings + 1));
        }}
        onCancel={() => {
          const url = PositionTypeRoute.generate(params);
          history.push(url);
        }}
      />
    );
  };

  const renderSettings = () => {
    return (
      <Settings
        positionType={positionType}
        submitText={t("Save")}
        onSubmit={async (
          forPermanentPositions: boolean,
          needsReplacement: NeedsReplacement,
          forStaffAugmentation: boolean,
          minAbsenceDurationMinutes: number
        ) => {
          const newPositionType = {
            ...positionType,
            forPermanentPositions: forPermanentPositions,
            needsReplacement: needsReplacement,
            forStaffAugmentation: forStaffAugmentation,
            minAbsenceDurationMinutes: minAbsenceDurationMinutes,
          };
          setPositionType(newPositionType);
          //setStep(step + 1);
          // Update the URL to the next step
          //history.push(generateUrl(steps.replacement + 1));

          const id = await create(newPositionType);
          const viewParams = {
            ...params,
            positionTypeId: id!,
          };
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
        positionType: {
          orgId: positionType.orgId,
          name: positionType.name,
          forStaffAugmentation: positionType.forStaffAugmentation,
          forPermanentPositions: positionType.forPermanentPositions,
          needsReplacement: positionType.needsReplacement,
          minAbsenceDurationMinutes: positionType.minAbsenceDurationMinutes,
          externalId: positionType.externalId,
          //defaultContractId: positionType.defaultContractId
        },
      },
    });
    return oc(result).data.positionType.create.id();
  };

  return (
    <>
      <PageTitle title={t("Create new position type")} />
      {tabs()}
      {step === steps[0].stepNumber && renderBasicInfoStep()}
      {step === steps[1].stepNumber && renderSettings()}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  label: {
    fontWeight: 500,
  },
}));

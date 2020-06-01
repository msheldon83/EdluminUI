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
  AbsenceReasonTrackingTypeId,
} from "graphql/server-types.gen";
import { CreatePositionType } from "./graphql/create.gen";
import { TabbedHeader as Tabs, Step } from "ui/components/tabbed-header";
import { Typography, makeStyles } from "@material-ui/core";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { GetPositionTypesDocument } from "reference-data/get-position-types.gen";

export const PositionTypeAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(PositionTypeAddRoute);
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const positionTypesReferenceQuery = {
    query: GetPositionTypesDocument,
    variables: { orgId: params.organizationId },
  };

  const [createPositionType] = useMutationBundle(CreatePositionType, {
    refetchQueries: [positionTypesReferenceQuery],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [name, setName] = React.useState<string | null>(null);
  const namePlaceholder = t("Math teacher");

  const [positionType, setPositionType] = React.useState<
    PositionTypeCreateInput
  >({
    orgId: params.organizationId,
    name: "",
    externalId: null,
    code: null,
    forPermanentPositions: true,
    needsReplacement: NeedsReplacement.Yes,
    forStaffAugmentation: true,
    minAbsenceDurationMinutes: 15,
    defaultContractId: null,
    payCodeId: null,
    absenceReasonTrackingTypeId: AbsenceReasonTrackingTypeId.Hourly,
    payTypeId: AbsenceReasonTrackingTypeId.Daily,
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
        onNameChange={name => setName(name)}
        namePlaceholder={namePlaceholder}
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
          needsReplacement: NeedsReplacement | undefined | null,
          forStaffAugmentation: boolean,
          minAbsenceDurationMinutes: number,
          absenceReasonTrackingTypeId: AbsenceReasonTrackingTypeId,
          payTypeId: AbsenceReasonTrackingTypeId | undefined | null,
          payCodeId: string | undefined | null,
          defaultContractId: string | undefined | null,
          code: string | undefined | null
        ) => {
          const newPositionType = {
            ...positionType,
            forPermanentPositions: forPermanentPositions,
            needsReplacement: needsReplacement,
            absenceReasonTrackingTypeId: absenceReasonTrackingTypeId,
            forStaffAugmentation: forStaffAugmentation,
            minAbsenceDurationMinutes: minAbsenceDurationMinutes,
            defaultContractId: defaultContractId,
            payTypeId: payTypeId,
            payCodeId: payCodeId,
            code,
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
        positionType: {
          ...positionType,
          externalId:
            positionType.externalId &&
            positionType.externalId.trim().length === 0
              ? null
              : positionType.externalId,
        },
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
      <div className={classes.header}>
        <PageTitle title={t("Create new position type")} />
        <Typography variant="h1">
          {name || (
            <span className={classes.placeholder}>{namePlaceholder}</span>
          )}
        </Typography>
      </div>
      <Tabs steps={steps} isWizard={true} showStepNumber={true}></Tabs>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  placeholder: {
    opacity: "0.2",
    filter: "alpha(opacity = 20)",
  },
}));

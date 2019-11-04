import { useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { useRouteParams } from "ui/routes/definition";
import { useHistory } from "react-router";
// import { Settings } from "./components/add-edit-settings";
import { WorkDayScheduleCreateInput } from "graphql/server-types.gen";
// import { CreatePositionType } from "./graphql/create.gen";
import { TabbedHeader as Tabs, Step } from "ui/components/tabbed-header";
import { Typography, makeStyles } from "@material-ui/core";
import {
  BellScheduleRoute,
  BellScheduleAddRoute,
} from "ui/routes/bell-schedule";
import { AddBasicInfo, ScheduleSettings } from "./components/add-basic-info";

export const BellScheduleAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(BellScheduleAddRoute);
  const classes = useStyles();
  //const [createPositionType] = useMutationBundle(CreatePositionType);
  const [name, setName] = React.useState<string | null>(null);
  const namePlaceholder = t("Eastend High School");

  // Keep track of the initial Schedule settings to configure
  const [scheduleSettings, setScheduleSettings] = React.useState<
    ScheduleSettings
  >({
    isBasic: true,
    basicSettings: {
      hasVariants: true,
      hasHalfDayBreak: true,
    },
    periodSettings: {
      numberOfPeriods: 1,
    },
  });

  const [bellSchedule, setBellSchedule] = React.useState<
    WorkDayScheduleCreateInput
  >({
    orgId: Number(params.organizationId),
    name: "",
    externalId: null,
    description: null,
    workDayPatternId: null,
    periods: null,
    standardSchedule: null,
  });

  const renderBasicInfoStep = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <AddBasicInfo
        bellSchedule={bellSchedule}
        scheduleSettings={scheduleSettings}
        onSubmit={(name, scheduleSettings, externalId) => {
          setBellSchedule({
            ...bellSchedule,
            name: name,
            externalId: externalId,
          });
          setScheduleSettings(scheduleSettings);
          setStep(steps[1].stepNumber);
        }}
        onCancel={() => {
          const url = BellScheduleRoute.generate(params);
          history.push(url);
        }}
        onNameChange={name => setName(name)}
        namePlaceholder={namePlaceholder}
      />
    );
  };

  // const renderSettings = (
  //   setStep: React.Dispatch<React.SetStateAction<number>>
  // ) => {
  //   return (
  //     <Settings
  //       orgId={params.organizationId}
  //       positionType={positionType}
  //       submitText={t("Save")}
  //       onSubmit={async (
  //         forPermanentPositions: boolean,
  //         needsReplacement: NeedsReplacement | undefined | null,
  //         forStaffAugmentation: boolean,
  //         minAbsenceDurationMinutes: number,
  //         defaultContractId?: number | null
  //       ) => {
  //         const newPositionType = {
  //           ...positionType,
  //           forPermanentPositions: forPermanentPositions,
  //           needsReplacement: needsReplacement,
  //           forStaffAugmentation: forStaffAugmentation,
  //           minAbsenceDurationMinutes: minAbsenceDurationMinutes,
  //           defaultContractId: defaultContractId,
  //         };
  //         setPositionType(newPositionType);

  //         // Create the Position Type
  //         const id = await create(newPositionType);
  //         const viewParams = {
  //           ...params,
  //           positionTypeId: id!,
  //         };
  //         // Go to the Position Type View page
  //         history.push(PositionTypeViewRoute.generate(viewParams));
  //       }}
  //       onCancel={() => {
  //         const url = PositionTypeRoute.generate(params);
  //         history.push(url);
  //       }}
  //     />
  //   );
  // };

  // const create = async (positionType: PositionTypeCreateInput) => {
  //   const result = await createPositionType({
  //     variables: {
  //       positionType: {
  //         ...positionType,
  //         externalId: positionType.externalId && positionType.externalId.trim().length === 0 ? null : positionType.externalId
  //       }
  //     },
  //   });
  //   return result?.data?.positionType?.create?.id;
  // };

  const steps: Array<Step> = [
    {
      stepNumber: 0,
      name: t("Setup"),
      content: renderBasicInfoStep,
    },
    {
      stepNumber: 1,
      name: t("Regular"),
      content: () => <div>Regular</div>,
    },
    {
      stepNumber: 1,
      name: t("2 HR Delay"),
      content: () => <div>Regular1</div>,
    },
    {
      stepNumber: 1,
      name: t("3 HR Delay"),
      content: () => <div>Regular2</div>,
    },
    {
      stepNumber: 1,
      name: t("Early Dismissal"),
      content: () => <div>Regular3</div>,
    },
  ];

  return (
    <>
      <div className={classes.header}>
        <PageTitle title={t("Create bell schedule")} />
        <Typography variant="h1">
          {name || (
            <span className={classes.placeholder}>{namePlaceholder}</span>
          )}
        </Typography>
      </div>
      <Tabs steps={steps} isWizard={true}></Tabs>
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

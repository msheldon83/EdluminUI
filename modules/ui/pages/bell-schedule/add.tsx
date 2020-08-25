import { useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { useRouteParams } from "ui/routes/definition";
import { useHistory } from "react-router";
import {
  WorkDayScheduleCreateInput,
  FeatureFlag,
  WorkDayScheduleVariantType,
  WorkDayScheduleVariantInput,
} from "graphql/server-types.gen";
import { CreateWorkdaySchedule } from "./graphql/create.gen";
import { TabbedHeader as Tabs, Step } from "ui/components/tabbed-header";
import { Typography, makeStyles } from "@material-ui/core";
import {
  BellScheduleRoute,
  BellScheduleAddRoute,
  BellScheduleViewRoute,
} from "ui/routes/bell-schedule";
import { AddBasicInfo } from "./components/add-basic-info";
import { Schedule } from "./components/schedule";
import { secondsSinceMidnight } from "../../../helpers/time";
import { useOrgFeatureFlags } from "reference-data/org-feature-flags";
import { useWorkDayPatterns } from "reference-data/work-day-patterns";
import { useWorkDayScheduleVariantTypes } from "reference-data/work-day-schedule-variant-types";
import { Assign } from "./components/assign";
import { useSnackbar } from "hooks/use-snackbar";
import {
  ScheduleSettings,
  Period,
  BuildPeriodsFromSchedule,
  BuildPeriodsFromScheduleSettings,
  BellSchedule,
  Variant,
} from "./helpers";
import { ShowErrors } from "ui/components/error-helpers";

const scheduleSettingsDefaults: ScheduleSettings = {
  isBasic: true,
  periodSettings: {
    numberOfPeriods: 1,
  },
};

export const BellScheduleAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(BellScheduleAddRoute);
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const [createWorkdaySchedule] = useMutationBundle(CreateWorkdaySchedule, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [name, setName] = React.useState<string | null>(null);
  const namePlaceholder = t("Eastend High School");
  const [scheduleSettings, setScheduleSettings] = React.useState<
    ScheduleSettings
  >(scheduleSettingsDefaults);

  const orgFeatureFlags = useOrgFeatureFlags(params.organizationId);
  const orgWorkDayPatterns = useWorkDayPatterns(params.organizationId);
  const orgWorkDayScheduleVariantTypes = useWorkDayScheduleVariantTypes(
    params.organizationId
  );

  const [bellSchedule, setBellSchedule] = React.useState<BellSchedule>({
    name: "",
    standard: undefined,
    variants: [],
    locationIds: undefined,
    locationGroupIds: undefined,
  });

  if (
    !orgWorkDayScheduleVariantTypes ||
    !orgWorkDayScheduleVariantTypes.length
  ) {
    return <></>;
  }

  const orgUsesHalfDayBreaks: boolean = orgFeatureFlags.includes(
    FeatureFlag.HalfDayAbsences
  );
  const workDayPatternId: string = orgWorkDayPatterns.length
    ? orgWorkDayPatterns[0]!.id
    : "";

  const renderBasicInfoStep = (
    setStep: React.Dispatch<React.SetStateAction<number>>,
    goToNextStep: Function
  ) => {
    return (
      <AddBasicInfo
        bellSchedule={bellSchedule}
        scheduleSettings={scheduleSettingsDefaults}
        onSubmit={(name, scheduleSettings, externalId) => {
          setBellSchedule({
            ...bellSchedule,
            name: name,
            externalId: externalId,
          });
          setScheduleSettings(scheduleSettings);
          goToNextStep();
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

  const renderStandardSchedule = (
    setStep: React.Dispatch<React.SetStateAction<number>>,
    goToNextStep: Function,
    variantTypeId: string,
    variantTypeName: string
  ) => {
    const schedulePeriods: Array<Period> = [];
    if (bellSchedule.standard && bellSchedule.standard.periods) {
      schedulePeriods.push(
        ...BuildPeriodsFromSchedule(
          bellSchedule.standard.periods,
          bellSchedule.standard,
          orgUsesHalfDayBreaks,
          bellSchedule.standard
        )
      );
    } else {
      schedulePeriods.push(
        ...BuildPeriodsFromScheduleSettings(
          scheduleSettings,
          orgUsesHalfDayBreaks,
          t
        )
      );
    }

    return (
      <Schedule
        name={variantTypeName}
        isAdd={true}
        isStandard={true}
        submitLabel={t("Next")}
        periods={schedulePeriods}
        onSubmit={async (periods: Array<Period>) => {
          const updatedBellSchedule = {
            ...bellSchedule,
            standard: {
              periods: periods.map(p => {
                return {
                  ...p,
                  name: p.name || p.placeholder,
                };
              }),
              workDayScheduleVariantTypeId: variantTypeId,
            },
          };

          // Set the Bell Schedule in state and move to the next step
          setBellSchedule(updatedBellSchedule);
          goToNextStep();
        }}
        onCancel={() => {
          const url = BellScheduleRoute.generate(params);
          history.push(url);
        }}
      />
    );
  };

  const renderVariantSchedule = (
    setStep: React.Dispatch<React.SetStateAction<number>>,
    goToNextStep: Function,
    variantTypeId: string,
    variantTypeName: string,
    variantIndex: number
  ) => {
    const schedulePeriods: Array<Period> = [];
    if (bellSchedule.standard && bellSchedule.standard.periods) {
      const variant = bellSchedule.variants
        ? bellSchedule.variants[variantIndex]
        : null;
      schedulePeriods.push(
        ...BuildPeriodsFromSchedule(
          bellSchedule.standard.periods,
          variant,
          orgUsesHalfDayBreaks,
          bellSchedule.standard
        )
      );
    } else {
      schedulePeriods.push(
        ...BuildPeriodsFromScheduleSettings(
          scheduleSettings,
          orgUsesHalfDayBreaks,
          t
        )
      );
    }

    return (
      <Schedule
        name={variantTypeName}
        isStandard={false}
        isAdd={true}
        submitLabel={t("Next")}
        periods={schedulePeriods}
        onSubmit={async (periods: Array<Period>) => {
          // Non Standard Variant Type
          const updatedVariants = bellSchedule.variants || [];
          const variant: Variant = {
            workDayScheduleVariantTypeId: variantTypeId,
            periods: periods.filter(p => !p.skipped),
          };

          if (!updatedVariants[variantIndex]) {
            // First time populating this variant
            updatedVariants.push(variant);
          } else {
            // Update the existing variant in state
            updatedVariants[variantIndex] = variant;
          }

          // Add/Update variants on the Bell Schedule
          const updatedBellSchedule = {
            ...bellSchedule,
            variants: updatedVariants,
          };

          // Set the Bell Schedule in state and move to the next step
          setBellSchedule(updatedBellSchedule);
          goToNextStep();
        }}
        onCancel={() => {
          const url = BellScheduleRoute.generate(params);
          history.push(url);
        }}
      />
    );
  };

  const renderAssign = (
    setStep: React.Dispatch<React.SetStateAction<number>>,
    goToNextStep: Function
  ) => {
    return (
      <Assign
        locationsAssigned={[]}
        locationGroupsAssigned={[]}
        organizationId={params.organizationId}
        onSubmit={async (
          locationIds: Array<string>,
          locationGroupIds: Array<string>
        ) => {
          // Convert to Work Day Schedule to send to server
          const workDaySchedule = buildWorkDayScheduleCreateInput(
            { ...bellSchedule, locationIds, locationGroupIds },
            params.organizationId
          );

          // Create the Bell Schedule
          const id = await create(workDaySchedule);
          if (id) {
            const viewParams = {
              ...params,
              workDayScheduleId: id,
            };
            // Go to the Bell Schedule View page
            history.push(BellScheduleViewRoute.generate(viewParams));
          }
        }}
        onCancel={() => {
          const url = BellScheduleRoute.generate(params);
          history.push(url);
        }}
      />
    );
  };

  const create = async (bellSchedule: WorkDayScheduleCreateInput) => {
    const result = await createWorkdaySchedule({
      variables: {
        workdaySchedule: {
          ...bellSchedule,
          workDayPatternId: workDayPatternId,
          externalId:
            bellSchedule.externalId &&
            bellSchedule.externalId.trim().length === 0
              ? null
              : bellSchedule.externalId,
        },
      },
    });
    return result?.data?.workDaySchedule?.create?.id;
  };

  // Configure all of the tabs for the wizard
  let stepNumberCounter = 0;
  const tabs: Array<Step> = [
    {
      stepNumber: stepNumberCounter++,
      name: t("Setup"),
      content: renderBasicInfoStep,
    },
  ];

  // Add the Standard Variant Type as a Tab
  const standardVariantType = orgWorkDayScheduleVariantTypes.find(
    v => v.isStandard
  );
  if (standardVariantType) {
    tabs.push({
      stepNumber: stepNumberCounter++,
      name: standardVariantType.name || "",
      content: (
        setStep: React.Dispatch<React.SetStateAction<number>>,
        goToNextStep: Function
      ) => {
        return renderStandardSchedule(
          setStep,
          goToNextStep,
          standardVariantType.id,
          standardVariantType.name
        );
      },
    });
  }

  // Add Non Standard Variant Types as Tabs
  orgWorkDayScheduleVariantTypes
    .filter(v => !v.isStandard)
    .forEach((v, i) => {
      tabs.push({
        stepNumber: stepNumberCounter++,
        name: v.name || "",
        content: (
          setStep: React.Dispatch<React.SetStateAction<number>>,
          goToNextStep: Function
        ) => {
          return renderVariantSchedule(setStep, goToNextStep, v.id, v.name, i);
        },
      });
    });

  // Last Tab is the Location/Location Group Assignment
  tabs.push({
    stepNumber: stepNumberCounter,
    name: t("Assign"),
    content: renderAssign,
  });

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
      <Tabs steps={tabs} isWizard={true}></Tabs>
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

const buildWorkDayScheduleCreateInput = (
  bellSchedule: BellSchedule,
  organizationId: string
): WorkDayScheduleCreateInput => {
  let workDaySchedule: WorkDayScheduleCreateInput = {
    orgId: organizationId,
    name: bellSchedule.name,
    externalId: bellSchedule.externalId,
    additionalVariants: bellSchedule.variants.map((v: Variant) => {
      const variant: WorkDayScheduleVariantInput = {
        workDayScheduleVariantTypeId: v.workDayScheduleVariantTypeId,
        periods: v.periods
          .filter((p: Period) => !p.skipped)
          .map((p: Period) => {
            return {
              workDaySchedulePeriodName: p.name || p.placeholder,
              startTime: p.startTime ? secondsSinceMidnight(p.startTime) : null,
              endTime: p.endTime ? secondsSinceMidnight(p.endTime) : null,
              isHalfDayMorningEnd: p.isHalfDayMorningEnd,
              isHalfDayAfternoonStart: p.isHalfDayAfternoonStart,
            };
          }),
      };
      return variant;
    }),
    locationIds: bellSchedule.locationIds,
    locationGroupIds: bellSchedule.locationGroupIds,
  };

  if (bellSchedule.standard) {
    workDaySchedule = {
      ...workDaySchedule,
      periods: bellSchedule.standard.periods.map((p: Period) => {
        return {
          name: p.name || p.placeholder,
        };
      }),
      standardSchedule: {
        workDayScheduleVariantTypeId:
          bellSchedule.standard.workDayScheduleVariantTypeId,
        periods: bellSchedule.standard.periods.map((p: Period) => {
          return {
            workDaySchedulePeriodName: p.name || p.placeholder,
            startTime: p.startTime ? secondsSinceMidnight(p.startTime) : null,
            endTime: p.endTime ? secondsSinceMidnight(p.endTime) : null,
            isHalfDayMorningEnd: p.isHalfDayMorningEnd,
            isHalfDayAfternoonStart: p.isHalfDayAfternoonStart,
          };
        }),
      },
    };
  }

  return workDaySchedule;
};

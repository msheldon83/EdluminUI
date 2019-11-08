import { useMutationBundle, useQueryBundle } from "graphql/hooks";
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
  WorkDaySchedulePeriodInput,
  Maybe,
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
import { TFunction } from "i18next";
import { Schedule, Period } from "./components/schedule";
import {
  secondsSinceMidnight,
  midnightTime,
  timeStampToIso,
} from "../../../helpers/time";
import { useOrgFeatureFlags } from "reference-data/org-feature-flags";
import { useWorkDayPatterns } from "reference-data/work-day-patterns";
import { useWorkDayScheduleVariantTypes } from "reference-data/work-day-schedule-variant-types";

export type ScheduleSettings = {
  isBasic: boolean;
  periodSettings: {
    numberOfPeriods: number;
  };
};

const scheduleSettingsDefaults: ScheduleSettings = {
  isBasic: true,
  periodSettings: {
    numberOfPeriods: 1,
  },
};

const buildPeriodsFromScheduleSettings = (
  settings: ScheduleSettings,
  useHalfDayBreaks: boolean,
  t: TFunction
): Array<Period> => {
  const periods: Array<Period> = [];

  if (settings.isBasic) {
    // Basic Schedule
    periods.push({
      placeholder: t("Morning"),
      startTime: undefined,
      endTime: undefined,
    });
    periods.push({
      placeholder: t("Afternoon"),
      startTime: undefined,
      endTime: undefined,
    });
  } else {
    // Period Schedule
    for (let i = 0; i < settings.periodSettings.numberOfPeriods; i++) {
      periods.push({
        placeholder: `${t("Period")} ${i + 1}`,
        startTime: undefined,
        endTime: undefined,
      });
    }
  }

  // If using Half Day Breaks, add one into the list
  if (useHalfDayBreaks) {
    const middleIndex = Math.ceil(periods.length / 2);
    periods.splice(middleIndex, 0, {
      placeholder: t("Lunch"),
      startTime: undefined,
      endTime: undefined,
      isHalfDayAfternoonStart: true,
    });
    periods[middleIndex - 1].isHalfDayMorningEnd = true;
  }

  return periods;
};

const buildPeriodsFromSchedule = (
  periods: Array<Maybe<WorkDaySchedulePeriodInput>>,
  variant: WorkDayScheduleVariantInput | null | undefined,
  useHalfDayBreaks: boolean,
  standardSchedule: WorkDayScheduleVariantInput | null | undefined
) => {
  const schedulePeriods = periods.map(p => {
    const variantPeriod =
      variant && variant.periods
        ? variant.periods.find(vp => vp!.workDaySchedulePeriodName === p!.name)
        : null;

    return {
      name: p!.name || "",
      placeholder: "",
      startTime:
        variantPeriod && variantPeriod.startTime
          ? timeStampToIso(midnightTime().setSeconds(variantPeriod.startTime))
          : undefined,
      endTime:
        variantPeriod && variantPeriod.endTime
          ? timeStampToIso(midnightTime().setSeconds(variantPeriod.endTime))
          : undefined,
      isHalfDayMorningEnd:
        variantPeriod != null && (variantPeriod?.isHalfDayMorningEnd || false),
      isHalfDayAfternoonStart:
        variantPeriod != null &&
        (variantPeriod?.isHalfDayAfternoonStart || false),
    };
  });

  if (useHalfDayBreaks) {
    // Default Half Day Morning End and Half Day Afternoon Start if not set
    const currentHalfDayMorningEnd = schedulePeriods.find(
      p => p.isHalfDayMorningEnd
    );
    const currentHalfDayAfternoonStart = schedulePeriods.find(
      p => p.isHalfDayAfternoonStart
    );
    if (
      !currentHalfDayMorningEnd &&
      !currentHalfDayAfternoonStart &&
      standardSchedule &&
      standardSchedule.periods
    ) {
      const halfDayAfternoonStartIndex = standardSchedule.periods.findIndex(
        p => p!.isHalfDayAfternoonStart
      );
      const halfDayMorningEndIndex = standardSchedule.periods.findIndex(
        p => p!.isHalfDayMorningEnd
      );
      schedulePeriods[
        halfDayAfternoonStartIndex
      ].isHalfDayAfternoonStart = true;
      schedulePeriods[halfDayMorningEndIndex].isHalfDayMorningEnd = true;
    }
  }

  return schedulePeriods;
};

export const BellScheduleAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(BellScheduleAddRoute);
  const classes = useStyles();
  const [createWorkdaySchedule] = useMutationBundle(CreateWorkdaySchedule);
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

  const [bellSchedule, setBellSchedule] = React.useState<
    WorkDayScheduleCreateInput
  >({
    orgId: Number(params.organizationId),
    name: "",
    externalId: null,
    periods: null,
    standardSchedule: null,
    additionalVariants: null,
  });

  const orgUsesHalfDayBreaks: boolean = orgFeatureFlags.includes(
    FeatureFlag.HalfDayAbsences
  );
  const workDayPatternId: number = orgWorkDayPatterns.length
    ? Number(orgWorkDayPatterns[0]!.id)
    : 0;

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

  const renderSchedule = (
    setStep: React.Dispatch<React.SetStateAction<number>>,
    goToNextStep: Function,
    isStandard: boolean,
    variantTypeId: number,
    variantTypeName: string,
    isLastVariant: boolean,
    variantIndex: number
  ) => {
    const schedulePeriods: Array<Period> = [];
    if (bellSchedule.periods) {
      const variant = isStandard
        ? bellSchedule.standardSchedule
        : bellSchedule.additionalVariants
        ? bellSchedule.additionalVariants[variantIndex]
        : null;
      schedulePeriods.push(
        ...buildPeriodsFromSchedule(
          bellSchedule.periods,
          variant,
          orgUsesHalfDayBreaks,
          bellSchedule.standardSchedule
        )
      );
    } else {
      schedulePeriods.push(
        ...buildPeriodsFromScheduleSettings(
          scheduleSettings,
          orgUsesHalfDayBreaks,
          t
        )
      );
    }

    return (
      <Schedule
        name={variantTypeName}
        isStandard={isStandard}
        submitLabel={isLastVariant ? t("Save") : t("Next")}
        periods={schedulePeriods}
        onSubmit={async (periods: Array<Period>) => {
          let updatedBellSchedule = { ...bellSchedule };
          if (isStandard) {
            // Build out a Bell Schedule with the period info and standard schedule
            updatedBellSchedule = {
              ...bellSchedule,
              periods: periods.map(p => {
                return {
                  name: p.name || p.placeholder,
                };
              }),
              standardSchedule: {
                workDayScheduleVariantTypeId: variantTypeId,
                periods: periods.map(p => {
                  return {
                    workDaySchedulePeriodName: p.name || p.placeholder,
                    startTime: p.startTime
                      ? secondsSinceMidnight(p.startTime)
                      : null,
                    endTime: p.endTime ? secondsSinceMidnight(p.endTime) : null,
                    isHalfDayMorningEnd: p.isHalfDayMorningEnd,
                    isHalfDayAfternoonStart: p.isHalfDayAfternoonStart,
                  };
                }),
              },
            };
          } else {
            // Non Standard Variant Type
            const updatedVariants = bellSchedule.additionalVariants || [];
            const variant: WorkDayScheduleVariantInput = {
              workDayScheduleVariantTypeId: variantTypeId,
              periods: periods.map(p => {
                return {
                  workDaySchedulePeriodName: p.name || p.placeholder,
                  startTime: p.startTime
                    ? secondsSinceMidnight(p.startTime)
                    : null,
                  endTime: p.endTime ? secondsSinceMidnight(p.endTime) : null,
                  isHalfDayMorningEnd: p.isHalfDayMorningEnd,
                  isHalfDayAfternoonStart: p.isHalfDayAfternoonStart,
                };
              }),
            };

            if (!updatedVariants[variantIndex]) {
              // First time populating this variant
              updatedVariants.push(variant);
            } else {
              // Update the existing variant in state
              updatedVariants[variantIndex] = variant;
            }

            // Add/Update variants on the Bell Schedule
            updatedBellSchedule = {
              ...bellSchedule,
              additionalVariants: updatedVariants,
            };
          }

          if (isLastVariant) {
            // Go ahead and create the Bell Schedule
            const id = await create(updatedBellSchedule);
            const viewParams = {
              ...params,
              workDayScheduleId: id!,
            };
            // Go to the Bell Schedule View page
            history.push(BellScheduleViewRoute.generate(viewParams));
          } else {
            // Set the Bell Schedule in state and move to the next step
            setBellSchedule(updatedBellSchedule);
            goToNextStep();
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

  const tabs: Array<Step> = [
    {
      stepNumber: 0,
      name: t("Setup"),
      content: renderBasicInfoStep,
    },
  ];
  orgWorkDayScheduleVariantTypes.forEach((v, i) => {
    tabs.push({
      stepNumber: i + 1,
      name: v.name || "",
      content: (
        setStep: React.Dispatch<React.SetStateAction<number>>,
        goToNextStep: Function
      ) => {
        const isLastVariant = i === orgWorkDayScheduleVariantTypes.length - 1;
        return renderSchedule(
          setStep,
          goToNextStep,
          v.isStandard,
          Number(v.id),
          v.name,
          isLastVariant,
          i
        );
      },
    });
  });
  tabs.push({
    stepNumber: orgWorkDayScheduleVariantTypes.length + 1,
    name: t("Assign"),
    content: (
      setStep: React.Dispatch<React.SetStateAction<number>>,
      goToNextStep: Function
    ) => {
      return <div>est</div>;
    },
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

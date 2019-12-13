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
import { TFunction } from "i18next";
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
} from "./helpers";

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
  const [createWorkdaySchedule] = useMutationBundle(CreateWorkdaySchedule, {
    onError: error => {
      openSnackbar({
        message: error.graphQLErrors.map((e, i) => {
          const errorMessage =
            e.extensions?.data?.text ?? e.extensions?.data?.code;
          if (!errorMessage) {
            return null;
          }
          return <div key={i}>{errorMessage}</div>;
        }),
        dismissable: true,
        status: "error",
      });
    },
  });
  const { openSnackbar } = useSnackbar();
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
    locationIds: null,
    locationGroupIds: null,
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
        ...BuildPeriodsFromSchedule(
          bellSchedule.periods,
          variant,
          orgUsesHalfDayBreaks,
          bellSchedule.standardSchedule
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
        isStandard={isStandard}
        submitLabel={t("Next")}
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
              periods: periods
                .filter(p => !p.skipped)
                .map(p => {
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
        locationIds={[]}
        locationGroupIds={[]}
        organizationId={params.organizationId}
        onSubmit={async (
          locationIds: Array<number>,
          locationGroupIds: Array<number>
        ) => {
          const updatedBellSchedule = {
            ...bellSchedule,
            locationIds,
            locationGroupIds,
          };

          // Create the Bell Schedule
          const id = await create(updatedBellSchedule);
          if (id) {
            const viewParams = {
              ...params,
              workDayScheduleId: id!,
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
          i
        );
      },
    });
  });
  tabs.push({
    stepNumber: orgWorkDayScheduleVariantTypes.length + 1,
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

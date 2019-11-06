import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { useRouteParams } from "ui/routes/definition";
import { useHistory } from "react-router";
import { WorkDayScheduleCreateInput, FeatureFlag } from "graphql/server-types.gen";
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
import { RegularSchedule, Period } from "./components/regular-schedule";
import { secondsSinceMidnight } from "../../../helpers/time"
import { GetWorkDayPatterns } from "./graphql/work-day-patterns.gen";
import { GetOrgConfigFeatureFlags } from "./graphql/org-config-feature-flags.gen";
import { GetWorkDayScheduleVariantTypes } from "./graphql/org-work-day-schedule-variant-types.gen";

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

const buildPeriodsFromScheduleSettings = (settings: ScheduleSettings, useHalfDayBreaks: boolean, t: TFunction): Array<Period> => {  
  const periods: Array<Period> = [];

  if (settings.isBasic) {
    // Basic Schedule
    periods.push({ placeholder: t("Morning"), startTime: undefined, endTime: undefined });
    periods.push({ placeholder: t("Afternoon"), startTime: undefined, endTime: undefined });
  } else {
    // Period Schedule
    for (let i = 0; i < settings.periodSettings.numberOfPeriods; i++) {
      periods.push({ placeholder: `${t("Period")} ${i+1}`, startTime: undefined, endTime: undefined });
    }
  }

  // If using Half Day Breaks, add one into the list
  if (useHalfDayBreaks) {
    const middleIndex = Math.ceil(periods.length / 2);
    periods.splice(middleIndex, 0, { placeholder: t("Lunch"), startTime: undefined, endTime: undefined, isHalfDayAfternoonStart: true });
    periods[middleIndex-1].isHalfDayMorningEnd = true;
  }

  return periods;
};

export const BellScheduleAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(BellScheduleAddRoute);
  const classes = useStyles();
  const [createWorkdaySchedule] = useMutationBundle(CreateWorkdaySchedule);
  const [name, setName] = React.useState<string | null>(null);
  const [scheduleSettings, setScheduleSettings] = React.useState<ScheduleSettings>(scheduleSettingsDefaults);
  const namePlaceholder = t("Eastend High School");

  const [bellSchedule, setBellSchedule] = React.useState<
    WorkDayScheduleCreateInput
  >({
    orgId: Number(params.organizationId),
    name: "",
    externalId: null,
    periods: null,
    standardSchedule: null,
  });

  // Get the Org's Work Day Patterns (for now each org will only have one)
  const getWorkDayPatterns = useQueryBundle(GetWorkDayPatterns, {
    variables: { orgId: params.organizationId },
  });
  // Get the Org's Feature Flags to determine if they are using Half Day Absences
  const getOrgConfigFeatureFlags = useQueryBundle(GetOrgConfigFeatureFlags, {
    variables: { orgId: params.organizationId },
  });
  // Get the Org's defined Variant Types
  const getWorkDayScheduleVariantTypes = useQueryBundle(GetWorkDayScheduleVariantTypes, {
    variables: { orgId: params.organizationId },
  });

  if (getWorkDayPatterns.state === "LOADING" 
    || getOrgConfigFeatureFlags.state === "LOADING"
    || getWorkDayScheduleVariantTypes.state === "LOADING") {
    return <></>;
  }
  const allWorkDayPatterns = getWorkDayPatterns?.data?.workDayPattern?.all;
  const workDayPatternId: number = allWorkDayPatterns != null && allWorkDayPatterns.length
  ? Number(allWorkDayPatterns[0]!.id) : 0;
  const orgFeatureFlags = getOrgConfigFeatureFlags?.data?.organization?.byId?.config?.featureFlags;
  const orgUsesHalfDayBreaks: boolean = orgFeatureFlags != null && orgFeatureFlags.includes(FeatureFlag.HalfDayAbsences);
  const workDayScheduleVariantTypes = getWorkDayScheduleVariantTypes?.data?.orgRef_WorkDayScheduleVariantType?.all;
  const standardVariantType = workDayScheduleVariantTypes != null ? workDayScheduleVariantTypes.find(v => v!.isStandard) : null;
  const standardVariantTypeId: number = standardVariantType ? Number(standardVariantType.id) : 0;

  const renderBasicInfoStep = (
    setStep: React.Dispatch<React.SetStateAction<number>>
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

  const renderRegularSchedule = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const periods = buildPeriodsFromScheduleSettings(scheduleSettings, orgUsesHalfDayBreaks, t);
    return (
      <RegularSchedule
        periods={periods}
        onSubmit={async (
          periods: Array<Period>
        ) => {
          const newBellSchedule = {
            ...bellSchedule,
            periods: periods.map(p => {
              return {
                name: p.name || p.placeholder
              }
            }),
            standardSchedule: {
              workDayScheduleVariantTypeId: standardVariantTypeId,
              periods: periods.map(p => {
                return {
                  workDaySchedulePeriodName: p.name || p.placeholder,
                  startTime: p.startTime ? secondsSinceMidnight(p.startTime) : null,
                  endTime: p.endTime ? secondsSinceMidnight(p.endTime) : null,
                  isHalfDayMorningEnd: p.isHalfDayMorningEnd,
                  isHalfDayAfternoonStart: p.isHalfDayAfternoonStart
                }
              })
            }
          }

          // Create the Bell Schedule
          const id = await create(newBellSchedule);
          const viewParams = {
            ...params,
            workDayScheduleId: id!,
          };
          // Go to the Bell Schedule View page
          history.push(BellScheduleViewRoute.generate(viewParams));
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
          externalId: bellSchedule.externalId && bellSchedule.externalId.trim().length === 0 ? null : bellSchedule.externalId
        }
      },
    });
    return result?.data?.workDaySchedule?.create?.id;
  };

  const steps: Array<Step> = [
    {
      stepNumber: 0,
      name: t("Setup"),
      content: renderBasicInfoStep,
    },
    {
      stepNumber: 1,
      name: t("Regular"),
      content: renderRegularSchedule,
    },
    // TODO: Coming Soon (this should come from the Org's defined Variant Types)
    // {
    //   stepNumber: 1,
    //   name: t("2 HR Delay"),
    //   content: () => <div>Regular1</div>,
    // },
    // {
    //   stepNumber: 1,
    //   name: t("3 HR Delay"),
    //   content: () => <div>Regular2</div>,
    // },
    // {
    //   stepNumber: 1,
    //   name: t("Early Dismissal"),
    //   content: () => <div>Regular3</div>,
    // },
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

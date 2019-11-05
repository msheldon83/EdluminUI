import { useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { useRouteParams } from "ui/routes/definition";
import { useHistory } from "react-router";
// import { Settings } from "./components/add-edit-settings";
import { WorkDayScheduleCreateInput } from "graphql/server-types.gen";
import { CreateWorkdaySchedule } from "./graphql/create.gen";
import { TabbedHeader as Tabs, Step } from "ui/components/tabbed-header";
import { Typography, makeStyles } from "@material-ui/core";
import {
  BellScheduleRoute,
  BellScheduleAddRoute,
} from "ui/routes/bell-schedule";
import { AddBasicInfo } from "./components/add-basic-info";
import { TFunction } from "i18next";
import { RegularSchedule } from "./components/regular-schedule";

export type ScheduleSettings = {
  isBasic: boolean;
  basicSettings: {
    hasVariants: boolean;
    hasHalfDayBreak: boolean;
  };
  periodSettings: {
    numberOfPeriods: number;
  };
};

export type Period = {
  name?: string;
  placeholder: string;
  startTime: string;
  endTime: string;
  isHalfDayBreakPeriod?: boolean;
};

const scheduleSettingsDefaults: ScheduleSettings = {
  isBasic: true,
  basicSettings: {
    hasVariants: true,
    hasHalfDayBreak: true,
  },
  periodSettings: {
    numberOfPeriods: 1,
  },
};

export const BellScheduleAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(BellScheduleAddRoute);
  const classes = useStyles();
  const [createWorkdaySchedule] = useMutationBundle(CreateWorkdaySchedule);
  const [name, setName] = React.useState<string | null>(null);
  const namePlaceholder = t("Eastend High School");
  const [periodInfo, setPeriodInfo] = React.useState<{
    hasHalfDayBreak: boolean;
    periods: Array<Period>;
  }>({
    hasHalfDayBreak: true,
    periods: []
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

  const buildPeriodsFromScheduleSettings = (settings: ScheduleSettings, t: TFunction): Array<Period> => {
    const periods: Array<Period> = [];

    if (settings.isBasic) {
      // Basic Schedule
      periods.push({ placeholder: t("Morning"), startTime: "", endTime: "" });
      periods.push({ placeholder: t("Afternoon"), startTime: "", endTime: "" });
      return periods;
    }

    // Period Schedule
    for (let i = 0; i < settings.periodSettings.numberOfPeriods; i++) {
      periods.push({ placeholder: `${t("Period")} ${i+1}`, startTime: "", endTime: "" });
    }

    return periods;
  }

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
          setPeriodInfo({
            hasHalfDayBreak: scheduleSettings.isBasic && scheduleSettings.basicSettings.hasHalfDayBreak,
            periods: buildPeriodsFromScheduleSettings(scheduleSettings, t)
          });
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
    return (
      <RegularSchedule
        periods={periodInfo.periods}
        hasHalfDayBreak={periodInfo.hasHalfDayBreak}
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
              periods: periods.map(p => {
                return {
                  workDaySchedulePeriodName: p.name || p.placeholder,
                  startTime: Number(p.startTime),
                  endTime: Number(p.endTime)
                }
              })
            }
          }

          // Create the Work Day Schedule
          const id = await create(newBellSchedule);
          console.log(id);
          // const viewParams = {
          //   ...params,
          //   positionTypeId: id!,
          // };
          // // Go to the Position Type View page
          // history.push(PositionTypeViewRoute.generate(viewParams));
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

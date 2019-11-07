import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "hooks";
import { Typography } from "@material-ui/core";
import { GetWorkDayScheduleById } from "ui/pages/bell-schedule/graphql/workday-schedule.gen";
import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { makeStyles, Grid } from "@material-ui/core";
import { Redirect, useHistory } from "react-router";
import {
  BellScheduleRoute,
  BellScheduleViewRoute
} from "ui/routes/bell-schedule";
import { useRouteParams } from "ui/routes/definition";
import { useState } from "react";
import * as yup from "yup";
import { UpdateWorkDaySchedule } from "./graphql/update-workday-schedule.gen";
import { PageHeader } from "ui/components/page-header";
import { DeleteWorkDaySchedule } from "./graphql/delete-workday-schedule.gen";
import Maybe from "graphql/tsutils/Maybe";
import { Schedule, Period } from "./components/schedule";
import { TabbedHeader as Tabs, Step } from "ui/components/tabbed-header";
import { WorkDayScheduleVariant, WorkDayScheduleVariantPeriod, WorkDaySchedule, WorkDaySchedulePeriod, WorkDayScheduleVariantType } from "graphql/server-types.gen";
import { midnightTime, timeStampToIso, secondsSinceMidnight } from "helpers/time";
import { useWorkDayScheduleVariantTypes } from "reference-data/work-day-schedule-variant-types";

const editableSections = {
  name: "edit-name",
  externalId: "edit-external-id",
};

export const BellScheduleViewPage: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useScreenSize() === "mobile";
  const history = useHistory();
  const params = useRouteParams(BellScheduleViewRoute);
  const [editing, setEditing] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const orgWorkDayScheduleVariantTypes = useWorkDayScheduleVariantTypes(params.organizationId);

  const standardVariantType = orgWorkDayScheduleVariantTypes.find(v => v.isStandard);
  const variantTypes = orgWorkDayScheduleVariantTypes.filter(v => v.id !== standardVariantType?.id);

  const [deleteWorkDayScheduleMutation] = useMutationBundle(DeleteWorkDaySchedule);
  const deleteWorkDaySchedule = React.useCallback(() => {
    history.push(BellScheduleRoute.generate(params));
    return deleteWorkDayScheduleMutation({
      variables: {
        workDayScheduleId: Number(params.workDayScheduleId),
      },
    });
  }, [deleteWorkDayScheduleMutation, history, params]);

  const [updateWorkDaySchedule] = useMutationBundle(UpdateWorkDaySchedule);
  const enableDisableWorkDaySchedule = React.useCallback(
    (enabled: boolean, rowVersion: string) => {
      return updateWorkDaySchedule({
        variables: {
          workDaySchedule: {
            id: Number(params.workDayScheduleId),
            rowVersion: rowVersion,
            expired: !enabled,
          },
        },
      });
    },
    [updateWorkDaySchedule, params]
  );

  const getWorkDaySchedule = useQueryBundle(GetWorkDayScheduleById, {
    variables: { id: params.workDayScheduleId },
  });

  if (getWorkDaySchedule.state === "LOADING") {
    return <></>;
  }

  const workDaySchedule: WorkDaySchedule = getWorkDaySchedule?.data?.workDaySchedule?.byId as WorkDaySchedule;
  if (!workDaySchedule) {
    // Redirect the User back to the List page
    const listUrl = BellScheduleRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  if (enabled === null) {
    setEnabled(!workDaySchedule.expired);
  }

  const updateName = async (name: string) => {
    await updateWorkDaySchedule({
      variables: {
        workDaySchedule: {
          id: Number(workDaySchedule.id),
          rowVersion: workDaySchedule.rowVersion,
          name,
        },
      },
    });
  };

  const updateExternalId = async (externalId?: string | null) => {
    await updateWorkDaySchedule({
      variables: {
        workDaySchedule: {
          id: Number(workDaySchedule.id),
          rowVersion: workDaySchedule.rowVersion,
          externalId,
        },
      },
    });
  };

  const buildPeriods = (variant: Maybe<WorkDayScheduleVariant>, workDaySchedule: WorkDaySchedule): Array<Period> => {
    if (variant) {
      // Build the period list from the periods under the variant
      const periods: Array<Period> = variant.periods!
        .sort((a, b) => (a!.sequence || 0) - (b!.sequence || 0))
        .map((p: Maybe<WorkDayScheduleVariantPeriod>) => {
          const matchingPeriod = workDaySchedule.periods ? workDaySchedule.periods!.find((w: any) => w.sequence! === p!.sequence) : null;
          
          const startTimeString = timeStampToIso(midnightTime().setSeconds(p!.startTime));
          const endTimeString = timeStampToIso(midnightTime().setSeconds(p!.endTime))
          
          return {
            periodId: matchingPeriod?.id,
            variantPeriodId: p?.id,
            name: matchingPeriod ? matchingPeriod.name : "",
            placeholder: "",
            startTime: startTimeString,
            endTime: endTimeString,
            isHalfDayMorningEnd: p!.isHalfDayMorningEnd,
            isHalfDayAfternoonStart: p!.isHalfDayAfternoonStart
          }
        });
      return periods;
    } else {
      // Build the period list from the list of periods on the Work Day Schedule
      const periods: Array<Period> = workDaySchedule.periods!
        .sort((a, b) => (a!.sequence || 0) - (b!.sequence || 0))
        .map((p: Maybe<WorkDaySchedulePeriod>) => {
          return {
            periodId: p?.id,
            name: p!.name,
            placeholder: "",
            startTime: undefined,
            endTime: undefined
          }
        });
      
      // Default the startOfHalfdayAfternoon and endOfHalfdayMorning
      
      return periods;
    }    
  }

  const renderRegularSchedule = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const standardSchedule = workDaySchedule.variants!.find((v: Maybe<WorkDayScheduleVariant>) => v!.isStandard)!;
    const periods = buildPeriods(standardSchedule, workDaySchedule);

    return (
      <Schedule
        name={standardVariantType?.name}
        isStandard={true}
        periods={periods}
        variantId={Number(standardSchedule.id)}
        onSubmit={async (
          periods: Array<Period>,
          variantId: number | null | undefined
        ) => {
          // Regular allows update of Periods so call updateWorkDaySchedule
          // Variants only allow modifying the times and no drag and drop (and no add or remove row?)

          await updateStandardSchedule(periods, variantId);          
        }}
        onCancel={() => {
          const url = BellScheduleRoute.generate(params);
          history.push(url);
        }}
      />
    );
  };

  const updateStandardSchedule = async (periods: Array<Period>, variantId?: number | null | undefined) => {
    await updateWorkDaySchedule({
      variables: {
        workDaySchedule: {
          id: Number(workDaySchedule.id),
          rowVersion: workDaySchedule.rowVersion,
          periods: periods.map(p => {
            return {
              id: p.periodId ? Number(p.periodId) : null,
              name: p.name || p.placeholder
            }
          }),
          standardSchedule: {
            id: variantId,
            periods: periods.map(p => {
              return {
                id: p.variantPeriodId ? Number(p.variantPeriodId) : null,
                workDaySchedulePeriodName: p.name || p.placeholder,
                startTime: p.startTime ? secondsSinceMidnight(p.startTime) : null,
                endTime: p.endTime ? secondsSinceMidnight(p.endTime) : null,
                isHalfDayMorningEnd: p.isHalfDayMorningEnd,
                isHalfDayAfternoonStart: p.isHalfDayAfternoonStart
              }
            })
          }
        },
      },
    });
  };

  const renderVariant = (
    setStep: React.Dispatch<React.SetStateAction<number>>,   
    variantTypeId: string,
    variantTypeName: string
  ) => {
    const existingVariant = workDaySchedule.variants!.find((v: Maybe<WorkDayScheduleVariant>) => v!.workDayScheduleVariantTypeId.toString() === variantTypeId);
    const periods = buildPeriods(existingVariant, workDaySchedule);

    return (
      <Schedule
        name={variantTypeName}
        isStandard={false}
        periods={periods}
        variantId={existingVariant ? Number(existingVariant.id) : null}
        onSubmit={async (
          periods: Array<Period>,
          variantId: number | null | undefined
        ) => {
          // Regular allows update of Periods so call updateWorkDaySchedule
          // Variants only allow modifying the times and no drag and drop (and no add or remove row?)

          await updateStandardSchedule(periods, variantId);          
        }}
        onCancel={() => {
          const url = BellScheduleRoute.generate(params);
          history.push(url);
        }}
      />
    );
  };

  const updateVariantSchedule = async (periods: Array<Period>, variantId?: number | null | undefined) => {

  }

  const tabs: Array<Step> = [{
    stepNumber: 0,
    name: standardVariantType?.name || t("Regular"),
    content: renderRegularSchedule,
  }];  
  variantTypes.forEach((v, i) => {
    tabs.push({
      stepNumber: i+1,
      name: v.name || "",
      content: (setStep: React.Dispatch<React.SetStateAction<number>>) => {
        return renderVariant(setStep, v.id, v.name);
      },
    })
  });

  return (
    <>
      <PageTitle title={t("Bell Schedule")} withoutHeading={!isMobile} />
      <PageHeader
        text={workDaySchedule.name}
        label={t("Name")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.name)}
        validationSchema={yup.object().shape({
          value: yup.string().required(t("Name is required")),
        })}
        onSubmit={async (value: Maybe<string>) => {
          await updateName(value!);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
        actions={[
          {
            name: t("Change History"),
            onClick: () => {},
          },
          {
            name: enabled ? t("Inactivate") : t("Activate"),
            onClick: async () => {
              await enableDisableWorkDaySchedule(
                !enabled,
                workDaySchedule.rowVersion
              );
              setEnabled(!enabled);
            },
          },
          {
            name: t("Delete"),
            onClick: deleteWorkDaySchedule,
          },
        ]}
        isInactive={!enabled}
        inactiveDisplayText={t("This bell schedule is currently inactive.")}
        onActivate={async () => {
          await enableDisableWorkDaySchedule(true, workDaySchedule.rowVersion);
          setEnabled(true);
        }}
      />
      <PageHeader
        text={workDaySchedule.externalId}
        label={t("External ID")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.externalId)}
        validationSchema={yup.object().shape({
          value: yup.string().nullable(),
        })}
        onSubmit={async (value: Maybe<string>) => {
          await updateExternalId(value);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
        isSubHeader={true}
        showLabel={true}
      />
      <Tabs steps={tabs} isWizard={false} />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  valueMissing: {
    opacity: "0.6",
    filter: "alpha(opacity = 60)",
  },
}));

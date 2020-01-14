import { makeStyles, Typography } from "@material-ui/core";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import {
  WorkDaySchedule,
  WorkDaySchedulePeriod,
  WorkDayScheduleUsage,
  WorkDayScheduleVariant,
  PermissionEnum,
} from "graphql/server-types.gen";
import Maybe from "graphql/tsutils/Maybe";
import {
  midnightTime,
  secondsSinceMidnight,
  timeStampToIso,
} from "helpers/time";
import { useIsMobile } from "hooks";
import * as React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Redirect, useHistory } from "react-router";
import { useWorkDayScheduleVariantTypes } from "reference-data/work-day-schedule-variant-types";
import { PageHeader } from "ui/components/page-header";
import { PageTitle } from "ui/components/page-title";
import { Step, TabbedHeader as Tabs } from "ui/components/tabbed-header";
import { GetWorkDayScheduleById } from "ui/pages/bell-schedule/graphql/workday-schedule.gen";
import {
  BellScheduleRoute,
  BellScheduleViewRoute,
} from "ui/routes/bell-schedule";
import { useRouteParams } from "ui/routes/definition";
import * as yup from "yup";
import { Assign } from "./components/assign";
import { Schedule } from "./components/schedule";
import { Period } from "./helpers";
import { DeleteWorkDaySchedule } from "./graphql/delete-workday-schedule.gen";
import { UpdateWorkDayScheduleVariant } from "./graphql/update-workday-schedule-variant.gen";
import { UpdateWorkDaySchedule } from "./graphql/update-workday-schedule.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { parseISO, isEqual } from "date-fns";
import { ShowErrors } from "ui/components/error-helpers";
import { Can } from "ui/components/auth/can";

const editableSections = {
  name: "edit-name",
  externalId: "edit-external-id",
};

export const BellScheduleViewPage: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const history = useHistory();
  const params = useRouteParams(BellScheduleViewRoute);
  const [editing, setEditing] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const { openSnackbar } = useSnackbar();
  const orgWorkDayScheduleVariantTypes = useWorkDayScheduleVariantTypes(
    params.organizationId
  );
  const [updateWorkDayScheduleVariant] = useMutationBundle(
    UpdateWorkDayScheduleVariant,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const standardVariantType = orgWorkDayScheduleVariantTypes.find(
    v => v.isStandard
  );
  const variantTypes = orgWorkDayScheduleVariantTypes.filter(
    v => v.id !== standardVariantType?.id
  );

  const [deleteWorkDayScheduleMutation] = useMutationBundle(
    DeleteWorkDaySchedule
  );
  const deleteWorkDaySchedule = React.useCallback(async () => {
    await deleteWorkDayScheduleMutation({
      variables: {
        workDayScheduleId: Number(params.workDayScheduleId),
      },
      awaitRefetchQueries: true,
      refetchQueries: ["GetAllWorkDaySchedulesWithinOrg"],
    });
    history.push(BellScheduleRoute.generate(params));
  }, [deleteWorkDayScheduleMutation, history, params]);

  const [updateWorkDaySchedule] = useMutationBundle(UpdateWorkDaySchedule, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
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

  const workDaySchedule: WorkDaySchedule = getWorkDaySchedule?.data
    ?.workDaySchedule?.byId as WorkDaySchedule;
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

  const buildPeriods = (
    variant: Maybe<WorkDayScheduleVariant>,
    workDaySchedule: WorkDaySchedule,
    endOfDayPeriodName?: string
  ): Array<Period> => {
    if (!workDaySchedule.periods) {
      return [];
    }

    const periods: Array<Period> = workDaySchedule.periods.map(
      (p: Maybe<WorkDaySchedulePeriod>) => {
        // If we have a Variant defined, look for a matching VariantPeriod to this Period
        const matchingVariantPeriod =
          variant && variant.periods
            ? variant.periods.find(
                vp => vp!.workDaySchedulePeriodId.toString() === p!.id
              )
            : null;

        return {
          periodId: p!.id,
          variantPeriodId: matchingVariantPeriod?.id || null,
          name: p!.name,
          placeholder: "",
          startTime: matchingVariantPeriod
            ? timeStampToIso(
                midnightTime().setSeconds(matchingVariantPeriod.startTime)
              )
            : undefined,
          endTime: matchingVariantPeriod
            ? timeStampToIso(
                midnightTime().setSeconds(matchingVariantPeriod.endTime)
              )
            : undefined,
          isHalfDayMorningEnd:
            matchingVariantPeriod != null &&
            matchingVariantPeriod.isHalfDayMorningEnd,
          isHalfDayAfternoonStart:
            matchingVariantPeriod != null &&
            matchingVariantPeriod.isHalfDayAfternoonStart,
          skipped:
            matchingVariantPeriod == null && p!.name !== endOfDayPeriodName,
          sequence:
            matchingVariantPeriod && matchingVariantPeriod.sequence
              ? matchingVariantPeriod.sequence
              : p!.sequence ?? 0,
          isEndOfDayPeriod: p!.name === endOfDayPeriodName,
        };
      }
    );

    const sortedPeriods = periods.sort(
      (a, b) => (a.sequence || 0) - (b.sequence || 0)
    );

    // Move unmatched periods (skipped) to the bottom of the list
    const activePeriods = sortedPeriods.filter(p => !p.skipped);
    const skippedPeriods = sortedPeriods.filter(p => p.skipped);
    const sortedWithSkippedPeriods = [...activePeriods, ...skippedPeriods];

    return sortedWithSkippedPeriods;
  };

  const renderRegularSchedule = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const standardSchedule = workDaySchedule.variants!.find(
      (v: Maybe<WorkDayScheduleVariant>) => v!.isStandard
    )!;
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
          await updateStandardSchedule(periods, variantId);
        }}
        onCancel={() => {
          const url = BellScheduleRoute.generate(params);
          history.push(url);
        }}
      />
    );
  };

  const updateStandardSchedule = async (
    periods: Array<Period>,
    variantId?: number | null | undefined
  ) => {
    await updateWorkDaySchedule({
      variables: {
        workDaySchedule: {
          id: Number(workDaySchedule.id),
          rowVersion: workDaySchedule.rowVersion,
          periods: periods.map(p => {
            return {
              id: p.periodId ? Number(p.periodId) : null,
              name: p.name || p.placeholder,
            };
          }),
          standardSchedule: {
            id: variantId,
            periods: periods.map(p => {
              return {
                id: p.variantPeriodId ? Number(p.variantPeriodId) : null,
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
        },
      },
    });

    // Refresh the Work Day Schedule
    await getWorkDaySchedule.refetch();
  };

  const renderVariant = (
    setStep: React.Dispatch<React.SetStateAction<number>>,
    variantTypeId: string,
    variantTypeName: string
  ) => {
    const existingVariant = workDaySchedule.variants!.find(
      (v: Maybe<WorkDayScheduleVariant>) =>
        v!.workDayScheduleVariantTypeId.toString() === variantTypeId
    );

    // Find the End of Day period name
    let endOfDayPeriodName: string | undefined = undefined;
    const standardSchedule = workDaySchedule.variants!.find(
      (v: Maybe<WorkDayScheduleVariant>) => v!.isStandard
    )!;
    const lastPeriod = standardSchedule.periods![
      standardSchedule.periods!.length - 1
    ];
    if (
      lastPeriod &&
      lastPeriod.startTime &&
      lastPeriod.endTime &&
      lastPeriod.startTime === lastPeriod.endTime
    ) {
      endOfDayPeriodName = workDaySchedule.periods!.find(
        p => Number(p!.id) === lastPeriod.workDaySchedulePeriodId
      )?.name;
    }

    const periods = buildPeriods(
      existingVariant,
      workDaySchedule,
      endOfDayPeriodName
    );

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
          await updateVariantSchedule(periods, variantTypeId, variantId);
        }}
        onCancel={() => {
          const url = BellScheduleRoute.generate(params);
          history.push(url);
        }}
      />
    );
  };

  const updateVariantSchedule = async (
    periods: Array<Period>,
    variantTypeId: string,
    variantId?: number | null | undefined
  ) => {
    await updateWorkDayScheduleVariant({
      variables: {
        workDayScheduleVariant: {
          workDayScheduleId: Number(workDaySchedule.id),
          rowVersion: workDaySchedule.rowVersion,
          scheduleVariant: {
            id: variantId ?? undefined,
            workDayScheduleVariantTypeId: Number(variantTypeId),
            periods: periods
              .filter(p => !p.skipped)
              .map(p => {
                return {
                  id: p.variantPeriodId ? Number(p.variantPeriodId) : undefined,
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
        },
      },
    });

    // Refetch the Work Day Schedule since the mutation above only modifies the Variant
    await getWorkDaySchedule.refetch();
  };

  const renderAssign = (
    setStep: React.Dispatch<React.SetStateAction<number>>,
    goToNextStep: Function
  ) => {
    const locationIds: Array<number> = workDaySchedule.usages
      ? workDaySchedule.usages
          .filter(u => u && u.locationId)
          .map((u: Maybe<WorkDayScheduleUsage>) => u!.locationId!)
      : [];
    const locationGroupIds: Array<number> = workDaySchedule.usages
      ? workDaySchedule.usages
          .filter(u => u && u.locationGroupId)
          .map((u: Maybe<WorkDayScheduleUsage>) => u!.locationGroupId!)
      : [];

    return (
      <Assign
        locationIds={locationIds}
        locationGroupIds={locationGroupIds}
        organizationId={params.organizationId}
        onSubmit={updateLocationAssigments}
        onCancel={() => {
          const url = BellScheduleRoute.generate(params);
          history.push(url);
        }}
      />
    );
  };

  const updateLocationAssigments = async (
    locationIds: Array<number>,
    locationGroupIds: Array<number>
  ) => {
    await updateWorkDaySchedule({
      variables: {
        workDaySchedule: {
          id: Number(workDaySchedule.id),
          rowVersion: workDaySchedule.rowVersion,
          locationIds,
          locationGroupIds,
        },
      },
    });

    // Refresh the Work Day Schedule
    await getWorkDaySchedule.refetch();
  };

  const tabs: Array<Step> = [
    {
      stepNumber: 0,
      name: standardVariantType?.name || t("Regular"),
      content: renderRegularSchedule,
    },
  ];
  variantTypes.forEach((v, i) => {
    tabs.push({
      stepNumber: i + 1,
      name: v.name || "",
      content: (setStep: React.Dispatch<React.SetStateAction<number>>) => {
        return renderVariant(setStep, v.id, v.name);
      },
    });
  });
  tabs.push({
    stepNumber: variantTypes.length + 1,
    name: t("Assign"),
    content: renderAssign,
  });

  return (
    <>
      <div className={classes.linkPadding}>
        <Link to={BellScheduleRoute.generate(params)} className={classes.link}>
          {t("Return to all bell schedules")}
        </Link>
      </div>
      <PageTitle title={t("Bell Schedule")} withoutHeading />
      <Can do={[PermissionEnum.ScheduleSettingsSave]} not>
        <Typography variant="h1">{workDaySchedule.name}</Typography>
      </Can>
      <Can do={[PermissionEnum.ScheduleSettingsSave]}>
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
            await enableDisableWorkDaySchedule(
              true,
              workDaySchedule.rowVersion
            );
            setEnabled(true);
          }}
        />
      </Can>
      <Can do={[PermissionEnum.ScheduleSettingsSave]} not>
        <Typography variant="h6">
          {workDaySchedule.externalId ? (
            `External ID: ${workDaySchedule.externalId}`
          ) : (
            <div>
              <span>External ID: </span>
              <span className={classes.valueMissing}>{t("Not Specified")}</span>
            </div>
          )}
        </Typography>
      </Can>
      <Can do={[PermissionEnum.ScheduleSettingsSave]}>
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
      </Can>
      <div className={classes.content}>
        <Tabs steps={tabs} isWizard={false} />
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  content: {
    marginTop: theme.spacing(2),
  },
  valueMissing: {
    opacity: "0.6",
    filter: "alpha(opacity = 60)",
  },
  link: {
    color: theme.customColors.blue,
    "&:visited": {
      color: theme.customColors.blue,
    },
  },
  linkPadding: {
    padding: "10px 0px 15px 10px",
  },
}));

import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "hooks";
import { Typography } from "@material-ui/core";
import { GetWorkDayScheduleById } from "ui/pages/bell-schedule/graphql/workday-schedule.gen";
import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { makeStyles, Grid } from "@material-ui/core";
import { minutesToHours, boolToDisplay } from "ui/components/helpers";
import { getDisplayName } from "ui/components/enumHelpers";
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
import { RegularSchedule, Period } from "./components/regular-schedule";
import { TabbedHeader as Tabs, Step } from "ui/components/tabbed-header";
import { WorkDayScheduleVariant, WorkDayScheduleVariantPeriod, WorkDaySchedule } from "graphql/server-types.gen";
import { humanizeTimeStamp } from "helpers/time";

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

  const workDaySchedule = getWorkDaySchedule?.data?.workDaySchedule?.byId;
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

  const renderRegularSchedule = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const standardSchedule = (workDaySchedule as WorkDaySchedule).variants!.find((v: Maybe<WorkDayScheduleVariant>) => v!.isStandard)!;
    const periods: Array<Period> = standardSchedule.periods!.map((p: Maybe<WorkDayScheduleVariantPeriod>) => {
      return {
        name: "",
        placeholder: "",
        startTime: humanizeTimeStamp(p!.startTime),
        endTime: humanizeTimeStamp(p!.endTime),
        isHalfDayMorningEnd: p!.isHalfDayMorningEnd,
        isHalfDayAfternoonStart: p!.isHalfDayAfternoonStart
      }
    })

    return (
      <RegularSchedule
        periods={periods}
        onSubmit={async (
          periods: Array<Period>
        ) => {
          
        }}
        onCancel={() => {
          const url = BellScheduleRoute.generate(params);
          history.push(url);
        }}
      />
    );
  };

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
      <Tabs steps={[{
          stepNumber: 0,
          name: t("Regular"),
          content: renderRegularSchedule,
        }]}
        isWizard={false} 
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  valueMissing: {
    opacity: "0.6",
    filter: "alpha(opacity = 60)",
  },
}));

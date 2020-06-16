import { Button, Grid, makeStyles } from "@material-ui/core";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import { useMutationBundle, usePagedQueryBundle } from "graphql/hooks";
import { useIsMobile } from "hooks";
import { compact } from "lodash-es";
import { Column } from "material-table";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { PageTitle } from "ui/components/page-title";
import { Table } from "ui/components/table";
import {
  BellScheduleAddRoute,
  BellScheduleRoute,
  BellScheduleViewRoute,
} from "ui/routes/bell-schedule";
import { useRouteParams } from "ui/routes/definition";
import { DeleteWorkDaySchedule } from "./graphql/delete-workday-schedule.gen";
import { GetAllWorkDaySchedulesWithinOrg } from "./graphql/workday-schedules.gen";
import { Can } from "ui/components/auth/can";
import { PermissionEnum, DataImportType } from "graphql/server-types.gen";
import { ImportDataButton } from "ui/components/data-import/import-data-button";
import { Section } from "ui/components/section";

export const BellSchedulePage: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(BellScheduleRoute);
  const isMobile = useIsMobile();
  const [includeExpired, setIncludeExpired] = React.useState(false);

  const [getWorkDaySchedules, pagination] = usePagedQueryBundle(
    GetAllWorkDaySchedulesWithinOrg,
    r => r.workDaySchedule?.paged?.totalCount,
    {
      variables: { orgId: params.organizationId, includeExpired },
    }
  );

  const [deleteWorkDayScheduleMutation] = useMutationBundle(
    DeleteWorkDaySchedule
  );
  const deleteWorkDaySchedule = (workDayScheduleId: string) => {
    return deleteWorkDayScheduleMutation({
      variables: {
        workDayScheduleId: workDayScheduleId,
      },
    });
  };

  const deleteSelected = async (data: { id: string } | { id: string }[]) => {
    if (Array.isArray(data)) {
      await Promise.all(data.map(id => deleteWorkDaySchedule(id.id)));
    } else {
      await Promise.resolve(deleteWorkDaySchedule(data.id));
    }
    await getWorkDaySchedules.refetch();
  };

  if (
    getWorkDaySchedules.state === "LOADING" ||
    !getWorkDaySchedules.data.workDaySchedule?.paged?.results
  ) {
    return <></>;
  }

  const workDaySchedules = compact(
    getWorkDaySchedules?.data?.workDaySchedule?.paged?.results ?? []
  );
  const workDaySchedulesCount =
    getWorkDaySchedules?.data?.workDaySchedule?.paged?.totalCount ?? 0;

  const columns: Column<GetAllWorkDaySchedulesWithinOrg.Results>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
    },
    {
      title: t("Identifier"),
      field: "externalId",
      searchable: true,
      hidden: isMobile,
    },
    {
      title: t("In Use"),
      render: rowData => {
        const usageCount = rowData?.usages?.length ?? 0;
        return usageCount > 0 ? t("Yes") : t("No");
      },
      hidden: isMobile,
    },
    {
      title: t("# of Periods"),
      field: "periods.length",
      searchable: false,
      hidden: isMobile,
    },
  ];

  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        justify="space-between"
        spacing={2}
        className={classes.header}
      >
        <Grid item>
          <PageTitle title={t("Bell Schedules")} />
        </Grid>
        <Can do={[PermissionEnum.ScheduleSettingsSave]}>
          <Grid item>
            <Button
              variant="contained"
              component={Link}
              to={BellScheduleAddRoute.generate(params)}
            >
              {t("Add Bell Schedule")}
            </Button>
            <ImportDataButton
              orgId={params.organizationId}
              importType={DataImportType.WorkDaySchedule}
              label={t("Import bell schedules")}
              className={classes.importButton}
            />
          </Grid>
        </Can>
      </Grid>
      <Section>
        <Table
          title={`${workDaySchedulesCount} ${
            workDaySchedulesCount == 1
              ? t("Bell Schedule")
              : t("Bell Schedules")
          }`}
          columns={columns}
          data={workDaySchedules}
          selection={false}
          onRowClick={(event, workDaySchedule) => {
            if (!workDaySchedule) return;
            const newParams = {
              ...params,
              workDayScheduleId: workDaySchedule.id,
            };
            history.push(BellScheduleViewRoute.generate(newParams));
          }}
          options={{
            search: false,
            sorting: true,
          }}
          showIncludeExpired={true}
          onIncludeExpiredChange={checked => {
            pagination.resetPage();
            setIncludeExpired(checked);
          }}
          expiredRowCheck={(rowData: GetAllWorkDaySchedulesWithinOrg.Results) =>
            rowData.expired ?? false
          }
          pagination={pagination}
        />
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(),
  },
  importButton: {
    marginLeft: theme.spacing(1),
  },
}));

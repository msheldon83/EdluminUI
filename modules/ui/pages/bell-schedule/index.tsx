import { usePagedQueryBundle, useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { GetAllWorkDaySchedulesWithinOrg } from "./graphql/workday-schedules.gen";
import { DeleteWorkDaySchedule } from "./graphql/delete-workday-schedule.gen";
import * as React from "react";
import { Table } from "ui/components/table";
import { PageTitle } from "ui/components/page-title";
import { PaginationControls } from "ui/components/pagination-controls";
import { Link } from "react-router-dom";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { Column } from "material-table";
import { BellScheduleRoute, BellScheduleAddRoute, BellScheduleViewRoute } from "ui/routes/bell-schedule";
import { makeStyles, Grid, Button } from "@material-ui/core";
import { compact } from "lodash-es";
import { useScreenSize } from "hooks";
import DeleteOutline from "@material-ui/icons/DeleteOutline";

export const BellSchedulePage: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(BellScheduleRoute);
  const isMobile = useScreenSize() === "mobile";
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
        workDayScheduleId: Number(workDayScheduleId),
      },
    });
  };

  const deleteSelected = async (data: { id: string } | { id: string }[]) => {
    if (Array.isArray(data)) {
      await Promise.all(data.map(id => deleteWorkDaySchedule(id.id)));
    } else {
      await Promise.resolve(deleteWorkDaySchedule(data.id));
    }
    getWorkDaySchedules.refetch();
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
      title: t("External Id"),
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
        <Grid item>
          <Button
            variant="contained"
            component={Link}
            to={BellScheduleAddRoute.generate(params)}
          >
            {t("Add Bell Schedule")}
          </Button>
        </Grid>
      </Grid>
      <Table
        title={`${workDaySchedulesCount} ${
          workDaySchedulesCount == 1 ? t("Bell Schedule") : t("Bell Schedules")
        }`}
        columns={columns}
        data={workDaySchedules}
        selection={!isMobile}
        onRowClick={(event, workDaySchedule) => {
          if (!workDaySchedule) return;
          const newParams = {
            ...params,
            workDayScheduleId: workDaySchedule.id,
          };
          history.push(BellScheduleViewRoute.generate(newParams));
        }}
        options={{
          search: true,
          sorting: true,
          selectionProps: (
            rowData: GetAllWorkDaySchedulesWithinOrg.Results
          ) => ({
            disabled: rowData?.usages?.length
              ? rowData?.usages?.length > 0
              : false,
          }),
        }}
        showIncludeExpired={true}
        onIncludeExpiredChange={checked => {
          setIncludeExpired(checked);
        }}
        expiredRowCheck={(rowData: GetAllWorkDaySchedulesWithinOrg.Results) =>
          rowData.expired ?? false
        }
        actions={[
          {
            tooltip: `${t("Delete selected bell schedules")}`,
            icon: () => <DeleteOutline /> /* eslint-disable-line */, // This should be able to be "delete" as a string which will use the table delete icon, but that didn't work for some reason
            onClick: (event, data) => {
              deleteSelected(data);
            },
          },
        ]}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(),
  },
}));

import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { GetAllWorkDaySchedulesWithinOrg } from "ui/pages/bell-schedule/graphql/workday-schedules.gen";
import * as React from "react";
import { Table } from "ui/components/table";
import { PageTitle } from "ui/components/page-title";
import { useRouteParams } from "ui/routes/definition";
import { Column } from "material-table";
import { BellScheduleRoute } from "ui/routes/bell-schedule";
import { Grid, Button } from "@material-ui/core";
import { compact } from "lodash-es";

export const BellSchedulePage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(BellScheduleRoute)

  const getWorkDaySchedules = useQueryBundle(GetAllWorkDaySchedulesWithinOrg, {
    variables: { orgId: params.organizationId, limit: 25, offset: 0, includeExpired: false}
  });

  const columns: Column<GetAllWorkDaySchedulesWithinOrg.Results>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
    },
    { title: t("External Id"), field: "externalId", searchable: true },
    { 
      title: t("In Use"), 
      render: rowData => {
        const usageCount = rowData?.usages?.length ?? 0;
        return usageCount > 0 ?  t("Yes") : t("No");
      },
    },
    { title: t("# of Periods"), field: "periods.length", searchable: false},
  ];

  if (getWorkDaySchedules.state === "LOADING") {
    return <></>;
  }

  const workDaySchedules = compact(getWorkDaySchedules?.data?.workDaySchedule?.paged?.results ?? []);
  const workDaySchedulesCount = getWorkDaySchedules?.data?.workDaySchedule?.paged?.totalCount ?? 0;
  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        justify="space-between"
        spacing={2}
        >
          <Grid item>
            <PageTitle title={t("Bell Schedules")} />
          </Grid>
        </Grid>
      <Table
        title={`${workDaySchedulesCount} ${t("Bell Schedules")}`}
        columns={columns}
        data={workDaySchedules}
        selection={true}
        paging={true}
        options={{
          search: true,
        }}
      />
    </>
  );
};
import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";
import { Button, Divider, Grid, Typography } from "@material-ui/core";
import { useRouteParams } from "ui/routes/definition";
import { CalendarRoute } from "ui/routes/calendar/calendar";
import { Section } from "ui/components/section";
import { ContractScheduleHeader } from "ui/components/schedule/contract-schedule-header";
import { useState, useMemo } from "react";
import { ScheduleViewToggle } from "ui/components/schedule/schedule-view-toggle";
import { GetCalendarChanges } from "./graphql/get-calendar-changes.gen";
import {
  useQueryBundle,
  usePagedQueryBundle,
  useMutationBundle,
} from "graphql/hooks";
import { Column } from "material-table";
import { CalendarChange, CalendarDayType } from "graphql/server-types.gen";
import { Table } from "ui/components/table";
import { compact } from "lodash-es";
import { parseISO, format } from "date-fns";
import { PageTitle } from "ui/components/page-title";
import { PaginationControls } from "ui/components/pagination-controls";
import { CalendarDayTypes } from "reference-data/calendar-day-type";
import { useWorkDayScheduleVariantTypes } from "reference-data/work-day-schedule-variant-types";
import DeleteIcon from "@material-ui/icons/delete";
import { DeleteCalendarChange } from "./graphql/delete-calendar-change.gen";
import { CreateExpansionPanel } from "./components/create-expansion-panel";
import { CalendarView } from "./components/calendar-view";

import {
  CalendarListViewRoute,
  CalendarCalendarViewRoute,
} from "ui/routes/calendar/calendar";

type Props = {
  view: "list" | "calendar";
};

export const Calendars: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(CalendarRoute);
  const classes = useStyles();

  const [schoolYear, setSchoolYear] = useState();
  const [contract, setContract] = useState();

  const [getCalendarChanges, pagination] = usePagedQueryBundle(
    GetCalendarChanges,
    r => r.calendarChange?.paged?.totalCount,
    {
      variables: {
        orgId: params.organizationId,
        schoolYearId: parseInt(schoolYear?.id),
        contractId: contract,
      },
      fetchPolicy: "cache-and-network",
    }
  );

  const changesLoaded =
    getCalendarChanges.state === "LOADING" ||
    getCalendarChanges.state === "UPDATING"
      ? false
      : true;

  const calendarChanges =
    getCalendarChanges.state === "LOADING" ||
    getCalendarChanges.state === "UPDATING"
      ? []
      : compact(getCalendarChanges?.data?.calendarChange?.paged?.results ?? []);

  /*might want to put list into its own component.  Also make table editable for delete reasons.  Add paginatation.*/

  const orgWorkDayScheduleVariantTypes = useWorkDayScheduleVariantTypes(
    params.organizationId
  );

  const [deleteCalendarChangeMutation] = useMutationBundle(
    DeleteCalendarChange
  );

  const deleteCalendarChange = (calendarChangeId: string) => {
    return deleteCalendarChangeMutation({
      variables: {
        calendarChangeId: Number(calendarChangeId),
      },
    });
  };

  const columns: Column<GetCalendarChanges.Results>[] = [
    {
      title: t("Date"),
      field: "startDate",
      searchable: false,
      render: (o: GetCalendarChanges.Results) =>
        o.startDate === o.endDate
          ? format(parseISO(o.startDate), "MMM d, yyyy")
          : `${format(parseISO(o.startDate), "MMM d, yyyy")} to ${format(
              parseISO(o.endDate),
              "MMM d, yyyy"
            )}`,
    },
    {
      title: t("Type"),
      field: "calendarChangeReason.calendarDayTypeId",
      searchable: false,
      render: (o: GetCalendarChanges.Results) => {
        return o.calendarChangeReason?.calendarDayTypeId !==
          CalendarDayType.InstructionalDay
          ? CalendarDayTypes?.find(
              e =>
                e.enumValue.toString() ==
                o.calendarChangeReason?.calendarDayTypeId
            )?.name
          : orgWorkDayScheduleVariantTypes?.find(
              e =>
                e.id.toString() ==
                o.calendarChangeReason?.workDayScheduleVariantType?.id
            )?.name;
      },
    },
    {
      title: t("Reason"),
      field: "calendarChangeReason.name",
      searchable: false,
    },
    {
      title: t("Note"),
      field: "description",
      searchable: false,
    },
    {
      title: t("Contract"),
      field: "changedContracts[0].name",
      searchable: false,
    },
  ];
  /*TODO Need a way to delete a calendar event*/

  /*TODO Need a way to add a calendar event*/

  /*TODO This page will store dates selected and schools years, and include a calendar cmpt and list cmpt */

  return (
    <>
      <div className={classes.pageContainer}>
        <Section className={classes.container}>
          <CreateExpansionPanel />
        </Section>
        <Section className={classes.container}>
          <Grid container>
            <Grid item xs={12} className={classes.filters}>
              <div className={classes.scheduleHeader}>
                <ContractScheduleHeader
                  view={props.view}
                  schoolYearValue={schoolYear?.id}
                  setSchoolYear={setSchoolYear}
                  contractValue={contract}
                  setContract={setContract}
                  orgId={params.organizationId}
                />
              </div>
              <div>
                <ScheduleViewToggle
                  view={props.view}
                  listViewRoute={CalendarListViewRoute.generate(params)}
                  calendarViewRoute={CalendarCalendarViewRoute.generate(params)}
                />
              </div>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            {props.view === "list" && (
              <Grid item xs={12} className={classes.listContent}>
                <Grid container>
                  {!changesLoaded && (
                    <Typography variant="h6">
                      {t("Loading Calendar Events")}...
                    </Typography>
                  )}
                  {changesLoaded && (
                    <div>
                      <Table
                        selection={true}
                        columns={columns}
                        data={calendarChanges}
                        title={""}
                        actions={[
                          {
                            tooltip: t("Delete selected events"),
                            icon: () => <DeleteIcon />,
                            onClick: async (evt, data) => {
                              if (Array.isArray(data)) {
                                await Promise.all(
                                  data.map(cc => deleteCalendarChange(cc.id))
                                );
                              } else {
                                await Promise.resolve(
                                  deleteCalendarChange(data.id)
                                );
                              }
                              await getCalendarChanges.refetch();
                            },
                          },
                        ]}
                      />

                      <PaginationControls
                        pagination={pagination}
                        pageSizeOptions={[25, 50, 100, 250, 500]}
                      />
                    </div>
                  )}
                </Grid>
              </Grid>
            )}
            {props.view === "calendar" && (
              <CalendarView
                calandarChangeDates={calendarChanges}
                fromDate={parseISO(schoolYear?.startDate)}
                toDate={parseISO(schoolYear?.endDate)}
              />
            )}
          </Grid>
        </Section>
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  pageContainer: {
    display: "block",
    overflowY: "scroll",
    height: "100vh",
    position: "fixed",
    paddingRight: theme.spacing(3),
  },
  container: {
    padding: 0,
  },
  detail: {
    padding: theme.spacing(2),
  },
  scheduleHeader: {
    display: "flex",
  },
  listContent: {
    padding: theme.spacing(3),
  },
  shadedRow: {
    background: theme.customColors.lightGray,
    borderTop: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    borderBottom: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
  },

  filters: {
    padding: theme.spacing(3),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: { paddingBottom: theme.spacing(3) },
  itemContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `${theme.typography.pxToRem(14)} ${theme.typography.pxToRem(24)}`,
  },
  item: {
    display: "flex",
    alignItems: "center",
  },
  viewContainer: {
    padding: `0 ${theme.typography.pxToRem(24)} ${theme.typography.pxToRem(
      18
    )}`,
  },
  sticky: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: theme.customColors.appBackgroundGray,
    boxShadow: `0 ${theme.typography.pxToRem(32)} ${theme.typography.pxToRem(
      16
    )} -${theme.typography.pxToRem(13)} ${
      theme.customColors.appBackgroundGray
    }`,
  },
  assignments: {
    padding: theme.spacing(1),
  },
}));

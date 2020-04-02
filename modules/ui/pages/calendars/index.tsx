import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";
import { Divider, Grid, Typography } from "@material-ui/core";
import { useRouteParams } from "ui/routes/definition";
import { CalendarRoute } from "ui/routes/calendar/calendar";
import { Section } from "ui/components/section";
import { ContractScheduleHeader } from "ui/components/schedule/contract-schedule-header";
import { useState, useMemo, useCallback } from "react";
import { ScheduleViewToggle } from "ui/components/schedule/schedule-view-toggle";
import { GetCalendarChanges } from "./graphql/get-calendar-changes.gen";
import { usePagedQueryBundle, useMutationBundle } from "graphql/hooks";
import { Column } from "material-table";
import {
  CalendarChange,
  CalendarDayType,
  PermissionEnum,
} from "graphql/server-types.gen";
import { Table } from "ui/components/table";
import { compact } from "lodash-es";
import { parseISO, format, isBefore } from "date-fns";
import { PageTitle } from "ui/components/page-title";
import { CalendarDayTypes } from "reference-data/calendar-day-type";
import { useWorkDayScheduleVariantTypes } from "reference-data/work-day-schedule-variant-types";
import DeleteIcon from "@material-ui/icons/Delete";
import { DeleteCalendarChange } from "./graphql/delete-calendar-change.gen";
import { CreateExpansionPanel } from "./components/create-expansion-panel";
import { CalendarView } from "./components/calendar-view";
import { StickyHeader } from "./components/sticky-header";

import {
  CalendarListViewRoute,
  CalendarCalendarViewRoute,
} from "ui/routes/calendar/calendar";
import { Can } from "ui/components/auth/can";
import { EditableTable } from "ui/components/editable-table";
import { UpdateCalendarChange } from "./graphql/update-calendar-change.gen";
import { useAllSchoolYears } from "reference-data/school-years";
import { useContracts } from "reference-data/contracts";

type Props = {
  view: "list" | "calendar";
};

export const Calendars: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(CalendarRoute);
  const classes = useStyles();

  const [schoolYearId, setSchoolYearId] = useState<string | undefined>();
  const allSchoolYears = useAllSchoolYears(params.organizationId);
  const schoolYear = useMemo(
    () => allSchoolYears.find(x => x.id === schoolYearId),
    [allSchoolYears, schoolYearId]
  );

  const [contractId, setContractId] = useState<string | undefined>();
  const allContracts = useContracts(params.organizationId);
  const contract = useMemo(() => allContracts.find(x => x.id === contractId), [
    allContracts,
    contractId,
  ]);

  const [
    selectedDateCalendarChanges,
    setSelectedDateCalendarChanges,
  ] = useState();
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);

  const [getCalendarChanges, pagination] = usePagedQueryBundle(
    GetCalendarChanges,
    r => r.calendarChange?.paged?.totalCount,
    {
      variables: {
        orgId: params.organizationId,
        schoolYearId: schoolYearId,
        contractId: contractId,
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

  const sortedCalendarChanges = useMemo(
    () =>
      calendarChanges.sort(
        (a, b) => +new Date(a.startDate) - +new Date(b.startDate)
      ),
    [calendarChanges]
  );

  /*might want to put list into its own component.  Also make table editable for delete reasons.  Add paginatation.*/

  const orgWorkDayScheduleVariantTypes = useWorkDayScheduleVariantTypes(
    params.organizationId
  );

  const [updateCalendarChangeMutation] = useMutationBundle(
    UpdateCalendarChange
  );
  const updateCalendarChange = useCallback(
    async (updatedValues: {
      id: string;
      rowVersion: string;
      description?: string | null;
      changedContracts?: { id?: string }[];
      affectsAllContracts: boolean;
    }) => {
      const {
        id,
        rowVersion,
        changedContracts,
        affectsAllContracts,
        description,
      } = updatedValues;
      const contractIds = compact(changedContracts?.map(c => c?.id ?? ""));
      if (!id) return;
      await updateCalendarChangeMutation({
        variables: {
          calendarChange: {
            id: id,
            rowVersion,
            contractIds,
            affectsAllContracts,
            description,
          },
        },
      });
    },
    [updateCalendarChangeMutation]
  );

  const [deleteCalendarChangeMutation] = useMutationBundle(
    DeleteCalendarChange
  );

  const deleteCalendarChange = (calendarChangeId: string) => {
    return deleteCalendarChangeMutation({
      variables: {
        calendarChangeId: calendarChangeId,
      },
    });
  };

  const onDeleteCalendarChange = async (calendarChangeId: string) => {
    await Promise.resolve(deleteCalendarChange(calendarChangeId));
    await refectchCalendarChanges();
  };

  const refectchCalendarChanges = async () => {
    await getCalendarChanges.refetch();
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
      sorting: false,
      editable: "never",
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
      sorting: false,
      editable: "never",
    },
    {
      title: t("Reason"),
      field: "calendarChangeReason.name",
      searchable: false,
      sorting: false,
      editable: "never",
    },
    {
      title: t("Note"),
      field: "description",
      searchable: false,
      sorting: false,
      editable: "onUpdate",
    },
    {
      title: t("Contract"),
      searchable: false,
      render: (o: GetCalendarChanges.Results) => {
        const contracts = o.changedContracts?.map(c => {
          return c?.name;
        });
        if (contracts?.length === 0) {
          contracts.push(t("All Contracts"));
        }
        return contracts?.join(",");
      },
      sorting: false,
      editable: "never",
    },
  ];

  return (
    <>
      <div>
        <div>
          <Typography variant="h5">
            {contract === undefined ? t("All Contracts") : contract?.name}
          </Typography>

          {schoolYear && (
            <PageTitle
              title={`${t("Calendar")} ${parseISO(
                schoolYear.startDate
              ).getFullYear()} - ${parseISO(schoolYear.endDate).getFullYear()}`}
            />
          )}
        </div>
        <Can do={[PermissionEnum.CalendarChangeSave]}>
          <Section className={classes.container}>
            <CreateExpansionPanel
              refetchQuery={refectchCalendarChanges}
              orgId={params.organizationId}
            />
          </Section>
        </Can>
        <div className={props.view === "calendar" ? classes.sticky : ""}>
          {props.view === "calendar" && (
            <Section className={classes.calendarchanges}>
              <StickyHeader
                orgId={params.organizationId}
                calendarChanges={selectedDateCalendarChanges}
                onDelete={onDeleteCalendarChange}
                date={selectedDate}
              />
            </Section>
          )}
        </div>

        <Section className={classes.container}>
          <Grid container>
            <Grid item xs={12} className={classes.filters}>
              <div className={classes.scheduleHeader}>
                <ContractScheduleHeader
                  schoolYearId={schoolYearId}
                  setSchoolYearId={setSchoolYearId}
                  contractId={contract?.id}
                  setContractId={setContractId}
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
                {!changesLoaded && (
                  <Typography variant="h6">
                    {t("Loading Calendar Events")}...
                  </Typography>
                )}
                {changesLoaded && (
                  <div>
                    <EditableTable
                      selection={true}
                      selectionPermissions={[
                        PermissionEnum.CalendarChangeDelete,
                      ]}
                      columns={columns}
                      data={sortedCalendarChanges}
                      title={""}
                      onRowUpdate={{
                        action: async (newData, oldData) =>
                          await updateCalendarChange(newData),
                        permissions: [PermissionEnum.CalendarChangeSave],
                      }}
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
                          permissions: [PermissionEnum.CalendarChangeDelete],
                        },
                      ]}
                      pagination={pagination}
                    />
                  </div>
                )}
              </Grid>
            )}
            {props.view === "calendar" && (
              <CalendarView
                calandarChangeDates={calendarChanges}
                fromDate={parseISO(schoolYear?.startDate)}
                toDate={parseISO(schoolYear?.endDate)}
                setSelectedCalendarChanges={setSelectedDateCalendarChanges}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            )}
          </Grid>
        </Section>
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
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
    zIndex: 400,
    backgroundColor: theme.customColors.appBackgroundGray,

    boxShadow: `0 ${theme.typography.pxToRem(32)} ${theme.typography.pxToRem(
      16
    )} -${theme.typography.pxToRem(13)} ${
      theme.customColors.appBackgroundGray
    }`,
  },
  calendarchanges: {
    padding: theme.spacing(1),
    marginBottom: 0,
  },
}));

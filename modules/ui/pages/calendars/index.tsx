import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";
import { Divider, Grid, Typography, Button, Tooltip } from "@material-ui/core";
import { useRouteParams } from "ui/routes/definition";
import { CalendarRoute } from "ui/routes/calendar/calendar";
import { Section } from "ui/components/section";
import { useQueryParamIso } from "hooks/query-params";
import { ContractScheduleHeader } from "ui/components/schedule/contract-schedule-header";
import { useState, useMemo, useCallback } from "react";
import { TextButton } from "ui/components/text-button";
import { ScheduleViewToggle } from "ui/components/schedule/schedule-view-toggle";
import { GetCalendarChanges } from "./graphql/get-calendar-changes.gen";
import { usePagedQueryBundle, useMutationBundle } from "graphql/hooks";
import { Column } from "material-table";
import {
  CalendarDayType,
  PermissionEnum,
  DataImportType,
  CalendarChange,
  CalendarChangeCreateInput,
  CalendarChangeUpdateInput,
} from "graphql/server-types.gen";
import { compact } from "lodash-es";
import { parseISO, format, isBefore } from "date-fns";
import { PageTitle } from "ui/components/page-title";
import { CalendarDayTypes } from "reference-data/calendar-day-type";
import { useWorkDayScheduleVariantTypes } from "reference-data/work-day-schedule-variant-types";
import DeleteIcon from "@material-ui/icons/Delete";
import { DeleteCalendarChange } from "./graphql/delete-calendar-change.gen";
import { CalendarView } from "./components/calendar-view";
import { DayHeader } from "./components/event-day-header";
import { StickyHeader } from "./components/sticky-header";
import {
  CalendarListViewRoute,
  CalendarCalendarViewRoute,
} from "ui/routes/calendar/calendar";
import { Can } from "ui/components/auth/can";
import { UpdateCalendarChange } from "./graphql/update-calendar-change.gen";
import { useAllSchoolYears } from "reference-data/school-years";
import { CalendarLegend } from "./components/calendar-legend";
import { ContractScheduleWarning } from "ui/components/contract-schedule/contract-schedule-warning";
import { ImportDataButton } from "ui/components/data-import/import-data-button";
import { CalendarChangeEventDialog } from "./components/calendar-change-event-dialog";
import { useSnackbar } from "hooks/use-snackbar";
import { CreateCalendarChange } from "./graphql/create-calendar-change.gen";
import { ConvertApolloErrors } from "ui/components/error-helpers";
import { Table } from "ui/components/table";
import { CalendarEvent } from "./types";
import { useContractOptions } from "reference-data/contracts";
import { FilterQueryParams } from "./filter-params";
import { useLocationOptions } from "reference-data/locations";
import { SplitCalendarChange } from "./graphql/split-calendar-change.gen";

type Props = {
  view: "list" | "calendar";
};

export const Calendars: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(CalendarRoute);
  const classes = useStyles();
  const [filters, updateFilters] = useQueryParamIso(FilterQueryParams);
  const { openSnackbar } = useSnackbar();
  const [errorMessage, setErrorMessage] = useState("");

  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [hideChanges, setHideChanges] = useState(true);
  const allSchoolYears = useAllSchoolYears(params.organizationId);
  const schoolYear = useMemo(
    () => allSchoolYears.find(x => x.id === filters.schoolYearId),
    [allSchoolYears, filters.schoolYearId]
  );

  const [headerCalendarChanges, setHeaderCalendarChanges] = useState<
    CalendarEvent[]
  >();

  const contractOptions = useContractOptions(params.organizationId);
  const contract = useMemo(
    () => contractOptions.find(x => x.value === filters.contractId),
    [contractOptions, filters.contractId]
  );

  const locationOptions = useLocationOptions(params.organizationId);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [selectedDate, setSelectedDate] = useState(today);

  const initialCalendarChange: CalendarEvent[] = [
    {
      startDate: selectedDate.toISOString() ?? today.toISOString(),
      endDate: selectedDate.toISOString() ?? today.toISOString(),
      affectsAllContracts:
        filters.contractId === "" || filters.contractId === undefined
          ? true
          : false,
      affectsAllLocations:
        filters.locationId === "" || filters.locationId === undefined
          ? true
          : false,
      locationIds: filters.locationId === "" ? [] : [filters.locationId],
      contractIds: filters.contractId === "" ? [] : [filters.contractId],
    },
  ];

  const [
    selectedDateCalendarChanges,
    setSelectedDateCalendarChanges,
  ] = useState<CalendarEvent[]>(initialCalendarChange);

  const [isEdit, setIsEdit] = useState<boolean | undefined>(false);
  const [editSpecificDate, setEditSpecificDate] = useState(false);

  const [getCalendarChanges, pagination] = usePagedQueryBundle(
    GetCalendarChanges,
    r => r.calendarChange?.paged?.totalCount,
    {
      variables: {
        orgId: params.organizationId,
        schoolYearId:
          filters.schoolYearId === "" ? undefined : filters.schoolYearId,
        contractId: filters.contractId === "" ? undefined : filters.contractId,
        locationId: filters.locationId === "" ? undefined : filters.locationId,
      },
      fetchPolicy: "cache-and-network",
    }
  );

  const changesLoaded =
    getCalendarChanges.state === "LOADING" ||
    getCalendarChanges.state === "UPDATING"
      ? false
      : true;

  const calendarChanges = useMemo(() => {
    return !getCalendarChanges || getCalendarChanges.state === "LOADING"
      ? []
      : compact(getCalendarChanges?.data?.calendarChange?.paged?.results ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getCalendarChanges.state]);

  React.useEffect(() => {
    if (calendarChanges.length > 0) {
      const found = calendarChanges.filter(cc => {
        return (
          selectedDate >= parseISO(cc.startDate) &&
          selectedDate <= parseISO(cc.endDate)
        );
      });
      if (found) {
        setSelectedDateCalendarChanges(found as CalendarEvent[]);
        setHeaderCalendarChanges(found as CalendarEvent[]);
      } else {
        const cc: CalendarEvent[] = [
          {
            startDate: selectedDate.toISOString(),
            endDate: selectedDate.toISOString(),
            affectsAllContracts: true,
            affectsAllLocations: true,
          },
        ];
        setSelectedDateCalendarChanges(cc);
        setHeaderCalendarChanges(found as CalendarEvent[]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarChanges]);

  const sortedCalendarChanges = useMemo(
    () =>
      calendarChanges.sort(
        (a, b) => +new Date(a.startDate) - +new Date(b.startDate)
      ),
    [calendarChanges]
  );

  const orgWorkDayScheduleVariantTypes = useWorkDayScheduleVariantTypes(
    params.organizationId
  );

  const [updateCalendarChangeMutation] = useMutationBundle(
    UpdateCalendarChange,
    {
      onError: error => {
        setErrorMessage(ConvertApolloErrors(error));
      },
    }
  );
  const onUpdateCalendarChange = useCallback(
    async (calendarChange: CalendarChangeUpdateInput) => {
      const result = await updateCalendarChangeMutation({
        variables: {
          calendarChange,
        },
      });
      if (result && result.data) {
        setEditSpecificDate(false);
        await refectchCalendarChanges();
        return true;
      } else {
        return false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateCalendarChangeMutation]
  );

  const [splitCalendarChange] = useMutationBundle(SplitCalendarChange, {
    onError: error => {
      setErrorMessage(ConvertApolloErrors(error));
    },
  });

  const onSplitCalendarChange = useCallback(
    async (
      originalCalendarChangeId: string,
      calendarChange: CalendarEvent,
      forDelete?: boolean
    ) => {
      const createCalendar: CalendarChangeCreateInput = {
        startDate: calendarChange.startDate,
        endDate: calendarChange.endDate,
        orgId: params.organizationId,
        description: calendarChange.description,
        calendarChangeReasonId: calendarChange.calendarChangeReasonId,
        contractIds: calendarChange.contractIds as string[],
        locationIds: calendarChange.locationIds as string[],
        affectsAllContracts: calendarChange.affectsAllContracts ?? false,
        affectsAllLocations: calendarChange.affectsAllLocations ?? false,
      };

      const result = await splitCalendarChange({
        variables: {
          splitDetails: {
            originalCalendarChangeId,
            splitCalendarChange: createCalendar,
            forDelete: forDelete ?? false,
          },
        },
      });
      if (result && result.data) {
        setEditSpecificDate(false);

        await refectchCalendarChanges();
        return true;
      } else {
        return false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [splitCalendarChange]
  );

  const [deleteCalendarChangeMutation] = useMutationBundle(
    DeleteCalendarChange
  );

  const deleteCalendarChange = async (
    calendarChangeId: string,
    date?: Date
  ) => {
    if (date) {
      const changeToDelete: CalendarEvent = {
        startDate: format(date, "MMM d, yyyy"),
        endDate: format(date, "MMM d, yyyy"),
        affectsAllContracts: true,
        affectsAllLocations: true,
      };
      const result = await onSplitCalendarChange(
        calendarChangeId,
        changeToDelete,
        true
      );

      return result;
    } else {
      return deleteCalendarChangeMutation({
        variables: {
          calendarChangeId: calendarChangeId,
        },
      });
    }
  };

  const onDeleteCalendarChange = async (
    calendarChangeId: string,
    date?: Date
  ) => {
    await Promise.resolve(deleteCalendarChange(calendarChangeId, date));
    await refectchCalendarChanges();
  };

  const refectchCalendarChanges = async () => {
    await getCalendarChanges.refetch();
  };

  const dateInSchoolYear = (date: string) => {
    let found = false;
    const d = new Date(date);

    allSchoolYears.forEach(sy => {
      const sd = parseISO(sy.startDate);
      const ed = parseISO(sy.endDate);
      if (d >= sd && d <= ed) {
        found = true;
        return found;
      }
    });
    return found;
  };

  const [createCalendarChange] = useMutationBundle(CreateCalendarChange, {
    onError: error => {
      setErrorMessage(ConvertApolloErrors(error));
    },
  });

  const onCreateCalendarChange = async (
    calendarChange: CalendarChangeCreateInput
  ) => {
    if (
      isBefore(
        parseISO(calendarChange.endDate),
        parseISO(calendarChange.startDate)
      )
    ) {
      openSnackbar({
        message: t("The from date has to be before the to date."),
        dismissable: true,
        status: "error",
        autoHideDuration: 5000,
      });
      return false;
    }
    if (
      !dateInSchoolYear(calendarChange.startDate) ||
      !dateInSchoolYear(calendarChange.endDate)
    ) {
      openSnackbar({
        message: t("Please enter a date within the available school years."),
        dismissable: true,
        status: "error",
        autoHideDuration: 5000,
      });
      return false;
    }

    if (calendarChange.calendarChangeReasonId == undefined) {
      openSnackbar({
        message: t("Please provide a change reason."),
        dismissable: true,
        status: "error",
        autoHideDuration: 5000,
      });
      return false;
    }
    if (
      !calendarChange.affectsAllContracts &&
      calendarChange.contractIds == undefined
    ) {
      openSnackbar({
        message: t("Select a contract or choose, Apply To All Contracts."),
        dismissable: true,
        status: "error",
        autoHideDuration: 5000,
      });
      return false;
    }

    const result = await createCalendarChange({
      variables: {
        calendarChange,
      },
    });
    if (result?.data?.calendarChange?.create !== undefined) {
      setEditSpecificDate(false);
      await refectchCalendarChanges();
      return true;
    } else {
      return false;
    }
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
    },
    {
      title: t("Type"),
      field: "calendarChangeReason.calendarDayTypeId",
      searchable: false,
      render: (o: GetCalendarChanges.Results) => {
        return o.calendarChangeReason?.calendarDayTypeId !==
          CalendarDayType.InstructionalDay ||
          !o.calendarChangeReason?.workDayScheduleVariantTypeId
          ? CalendarDayTypes?.find(
              e =>
                e.enumValue.toString() ==
                o.calendarChangeReason?.calendarDayTypeId
            )?.name
          : orgWorkDayScheduleVariantTypes?.find(
              e =>
                e.id.toString() ==
                o.calendarChangeReason?.workDayScheduleVariantTypeId
            )?.name;
      },
      sorting: false,
    },
    {
      title: t("Reason"),
      field: "calendarChangeReason.name",
      searchable: false,
      sorting: false,
    },
    {
      title: t("School"),
      field: "locationIds",
      searchable: false,
      render: data => {
        if (data.affectsAllLocations) {
          return <Typography>{t("All Schools")}</Typography>;
        } else if (data?.locations?.length === 1) {
          return <Typography>{data?.locations?.[0]?.name}</Typography>;
        } else {
          return (
            <Tooltip
              className={classes.toolTip}
              placement="bottom-start"
              title={data?.locations?.map(l => l?.name).join(", ")}
            >
              <Typography>{`${data?.locations?.length} ${t(
                "Schools"
              )}`}</Typography>
            </Tooltip>
          );
        }
      },
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
    },
  ];

  const schoolYearName = `${parseISO(
    schoolYear?.startDate
  ).getFullYear()} - ${parseISO(schoolYear?.endDate).getFullYear()}`;

  const handleAddFromCalendar = (date: string) => {
    setSelectedDateCalendarChanges([
      {
        startDate: date,
        endDate: date,
        affectsAllContracts: true,
        affectsAllLocations: true,
      },
    ]);
    setOpenEventDialog(true);
  };

  const calendarChangeLength = headerCalendarChanges?.length ?? 0;

  const handleEditFromCalendar = (
    calendarChange: CalendarEvent,
    date?: Date
  ) => {
    setEditSpecificDate(!!date);
    setSelectedDateCalendarChanges([calendarChange]);
    setIsEdit(true);
    setOpenEventDialog(true);
  };
  return (
    <>
      <CalendarChangeEventDialog
        open={openEventDialog}
        orgId={params.organizationId}
        locationOptions={locationOptions}
        contractOptions={contractOptions}
        onAdd={onCreateCalendarChange}
        isEdit={isEdit}
        onUpdate={onUpdateCalendarChange}
        onClose={() => {
          setOpenEventDialog(false);
          setErrorMessage("");
          setIsEdit(false);
        }}
        onSplit={onSplitCalendarChange}
        calendarChange={selectedDateCalendarChanges}
        errorMessage={errorMessage}
        specificDate={editSpecificDate ? selectedDate : undefined}
      />
      <div>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={8}>
            <Typography variant="h5">
              {contract === undefined ? t("All Contracts") : contract?.value}
            </Typography>

            {schoolYear && (
              <PageTitle title={`${t("Calendar")} ${schoolYearName}`} />
            )}
          </Grid>
          <Can do={[PermissionEnum.CalendarChangeSave]}>
            <Grid item xs={2}>
              <ImportDataButton
                orgId={params.organizationId}
                importType={DataImportType.CalendarChange}
                label={t("Import events")}
              />
            </Grid>
            <Grid item xs={2}>
              {changesLoaded && (
                <Button
                  className={classes.floatRight}
                  onClick={() => {
                    setSelectedDateCalendarChanges(initialCalendarChange);
                    setIsEdit(false);
                    setOpenEventDialog(true);
                  }}
                  variant="contained"
                >
                  {t("Add Event")}
                </Button>
              )}
            </Grid>
          </Can>
        </Grid>
        <ContractScheduleWarning orgId={params.organizationId} />
        <div className={props.view === "calendar" ? classes.sticky : ""}>
          {props.view === "calendar" && (
            <Section className={classes.calendarChanges}>
              <DayHeader
                selectedDate={selectedDate}
                eventCount={headerCalendarChanges?.length ?? 0}
              />
              {headerCalendarChanges?.length !== 0 && (
                <>
                  {calendarChangeLength > 2 && hideChanges
                    ? headerCalendarChanges
                        ?.slice(0, 2)
                        ?.map((e, i) => (
                          <StickyHeader
                            key={i}
                            locationOptions={locationOptions}
                            contractOptions={contractOptions}
                            orgId={params.organizationId}
                            calendarChange={e}
                            onDelete={onDeleteCalendarChange}
                            date={selectedDate}
                            onAdd={handleAddFromCalendar}
                            onEdit={handleEditFromCalendar}
                          />
                        ))
                    : headerCalendarChanges?.map((e, i) => (
                        <StickyHeader
                          key={i}
                          locationOptions={locationOptions}
                          contractOptions={contractOptions}
                          orgId={params.organizationId}
                          calendarChange={e}
                          onDelete={onDeleteCalendarChange}
                          date={selectedDate}
                          onAdd={handleAddFromCalendar}
                          onEdit={handleEditFromCalendar}
                        />
                      ))}
                  {calendarChangeLength > 2 && (
                    <div className={classes.height}>
                      <TextButton
                        className={classes.floatLeft}
                        onClick={() => {
                          setHideChanges(!hideChanges);
                        }}
                      >
                        <span className={classes.link}>
                          {hideChanges
                            ? t(`+ ${calendarChangeLength - 2} more`)
                            : t("Hide events")}
                        </span>
                      </TextButton>
                    </div>
                  )}
                </>
              )}
            </Section>
          )}
        </div>
        <Section className={classes.container}>
          <Grid container>
            <Grid item xs={12} className={classes.filters}>
              <div className={classes.scheduleHeader}>
                <ContractScheduleHeader
                  paginationReset={() => pagination.resetPage()}
                  orgId={params.organizationId}
                />
              </div>
              <div>
                <ScheduleViewToggle
                  view={props.view}
                  listViewRoute={CalendarListViewRoute.generate(params)}
                  calendarViewRoute={CalendarCalendarViewRoute.generate(params)}
                  maintainQueryParams={true}
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
                    <Table
                      columns={columns}
                      data={sortedCalendarChanges}
                      selection={true}
                      pagination={pagination}
                      onRowClick={async (event, calendarChange) => {
                        const calendarEvent: CalendarEvent[] = [
                          {
                            id: calendarChange?.id,
                            rowVersion: calendarChange?.rowVersion,
                            description: calendarChange?.description,
                            startDate: calendarChange?.startDate,
                            endDate: calendarChange?.endDate,
                            calendarChangeReasonId:
                              calendarChange?.calendarChangeReason?.id,
                            affectsAllContracts:
                              calendarChange?.affectsAllContracts,
                            contractIds: calendarChange?.changedContracts?.map(
                              c => c?.id
                            ),
                          },
                        ];

                        setHeaderCalendarChanges(calendarEvent);
                        setSelectedDateCalendarChanges(calendarEvent);
                        setOpenEventDialog(true);
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
                    />
                  </div>
                )}
              </Grid>
            )}
            {props.view === "calendar" && (
              <>
                <CalendarLegend />
                <CalendarView
                  calandarChangeDates={calendarChanges as CalendarChange[]}
                  fromDate={parseISO(schoolYear?.startDate)}
                  toDate={parseISO(schoolYear?.endDate)}
                  setSelectedCalendarChanges={input => {
                    pagination.resetPage();
                    setHeaderCalendarChanges(input);
                    setSelectedDateCalendarChanges(input);
                  }}
                  selectedDate={selectedDate}
                  setSelectedDate={input => {
                    pagination.resetPage();
                    updateFilters({ date: format(input, "P") });
                    setSelectedDate(input);
                  }}
                />
              </>
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
  floatLeft: { float: "left" },
  floatRight: { float: "right" },
  sticky: {
    position: "sticky",
    top: 0,
    zIndex: 1001,
    backgroundColor: theme.customColors.appBackgroundGray,

    boxShadow: `0 ${theme.typography.pxToRem(32)} ${theme.typography.pxToRem(
      16
    )} -${theme.typography.pxToRem(13)} ${
      theme.customColors.appBackgroundGray
    }`,
  },
  calendarChanges: {
    padding: theme.spacing(1),
  },
  toolTip: {
    cursor: "pointer",
  },
  link: {
    textDecoration: "underline",
    color: theme.customColors.primary,
  },
  height: {
    height: "25px",
    paddingLeft: "15px",
  },
}));

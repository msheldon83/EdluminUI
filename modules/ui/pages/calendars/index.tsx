import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";
import { Divider, Grid, Typography, Button } from "@material-ui/core";
import { useRouteParams } from "ui/routes/definition";
import { CalendarRoute } from "ui/routes/calendar/calendar";
import { Section } from "ui/components/section";
import { ContractScheduleHeader } from "ui/components/schedule/contract-schedule-header";
import { useState, useMemo, useCallback } from "react";
import { ScheduleViewToggle } from "ui/components/schedule/schedule-view-toggle";
import { GetCalendarChanges } from "./graphql/get-calendar-changes.gen";
import {
  usePagedQueryBundle,
  useMutationBundle,
  useQueryBundle,
} from "graphql/hooks";
import { Column } from "material-table";
import {
  CalendarDayType,
  PermissionEnum,
  DataImportType,
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
import { StickyHeader } from "./components/sticky-header";
import {
  CalendarListViewRoute,
  CalendarCalendarViewRoute,
} from "ui/routes/calendar/calendar";
import { Can } from "ui/components/auth/can";
import { UpdateCalendarChange } from "./graphql/update-calendar-change.gen";
import { useAllSchoolYears } from "reference-data/school-years";
import { useContracts } from "reference-data/contracts";
import { ContractScheduleWarning } from "./components/contract-schedule-warning";
import { GetContractsWithoutSchedules } from "./graphql/get-contracts-without-schedules.gen";
import { ImportDataButton } from "ui/components/data-import/import-data-button";
import { CalendarChangeEventDialog } from "./components/calendar-change-event-dialog";
import { useSnackbar } from "hooks/use-snackbar";
import { CreateCalendarChange } from "./graphql/create-calendar-change.gen";
import { ConvertApolloErrors } from "ui/components/error-helpers";
import { Table } from "ui/components/table";
import { CalendarEvent } from "./types";

type Props = {
  view: "list" | "calendar";
};

export const Calendars: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(CalendarRoute);
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const [errorMessage, setErrorMessage] = useState("");

  const [openEventDialog, setOpenEventDialog] = useState(false);
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

  const today = useMemo(() => new Date(), []);

  const initialCalendarChange: CalendarEvent = {
    startDate: today.toISOString(),
    endDate: today.toISOString(),
    affectsAllContracts: true,
  };

  const [
    selectedDateCalendarChanges,
    setSelectedDateCalendarChanges,
  ] = useState(initialCalendarChange);

  const [selectedDate, setSelectedDate] = useState(today);

  const getContractsWithoutSchedules = useQueryBundle(
    GetContractsWithoutSchedules,
    {
      variables: {
        orgId: params.organizationId,
        schoolYearId: schoolYearId ?? "",
      },
      skip: !schoolYearId,
    }
  );
  const contractsWithoutSchedules =
    getContractsWithoutSchedules.state !== "LOADING"
      ? compact(
          getContractsWithoutSchedules?.data?.contract
            ?.contractsWithoutSchedules ?? []
        )
      : [];

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
    UpdateCalendarChange,
    {
      onError: error => {
        setErrorMessage(ConvertApolloErrors(error));
      },
    }
  );
  const updateCalendarChange = useCallback(
    async (calendarChange: CalendarChangeUpdateInput) => {
      const result = await updateCalendarChangeMutation({
        variables: {
          calendarChange,
        },
      });
      if (result && result.data) {
        await refectchCalendarChanges();
        return true;
      } else {
        return false;
      }
    },
    /* eslint-disable-line react-hooks/exhaustive-deps */ [
      updateCalendarChangeMutation,
    ]
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
      //editable: "never",
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
      //editable: "never",
    },
    {
      title: t("Reason"),
      field: "calendarChangeReason.name",
      searchable: false,
      sorting: false,
      //editable: "never",
    },
    {
      title: t("Note"),
      field: "description",
      searchable: false,
      sorting: false,
      // editable: "onUpdate",
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
      //  editable: "never",
    },
  ];

  const schoolYearName = `${parseISO(
    schoolYear?.startDate
  ).getFullYear()} - ${parseISO(schoolYear?.endDate).getFullYear()}`;

  return (
    <>
      <CalendarChangeEventDialog
        open={openEventDialog}
        onAdd={onCreateCalendarChange}
        onUpdate={updateCalendarChange}
        onClose={() => {
          setOpenEventDialog(false);
          setErrorMessage("");
        }}
        calendarChange={selectedDateCalendarChanges}
        errorMessage={errorMessage}
      />
      <div>
        <Grid container alignItems="center" justify="space-between" spacing={2}>
          <Grid item>
            <Typography variant="h5">
              {contract === undefined ? t("All Contracts") : contract?.name}
            </Typography>

            {schoolYear && (
              <PageTitle title={`${t("Calendar")} ${schoolYearName}`} />
            )}
          </Grid>
          <Can do={[PermissionEnum.CalendarChangeSave]}>
            <Grid item>
              <ImportDataButton
                orgId={params.organizationId}
                importType={DataImportType.CalendarChange}
                label={t("Import events")}
              />
            </Grid>
          </Can>
        </Grid>
        <ContractScheduleWarning
          showWarning={contractsWithoutSchedules.length > 0}
          schoolYearName={schoolYearName}
          schoolYear={schoolYear}
          contracts={contractsWithoutSchedules}
          orgId={params.organizationId}
        />

        <div className={props.view === "calendar" ? classes.sticky : ""}>
          {props.view === "calendar" && (
            <Section className={classes.calendarchanges}>
              <StickyHeader
                orgId={params.organizationId}
                calendarChange={selectedDateCalendarChanges}
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
                  setSchoolYearId={input => {
                    pagination.resetPage();
                    setSchoolYearId(input);
                  }}
                  contractId={contract?.id}
                  setContractId={input => {
                    pagination.resetPage();
                    setContractId(input);
                  }}
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
            <Grid direction={"row-reverse"} item container xs={12}>
              {changesLoaded && (
                <Can do={[PermissionEnum.CalendarChangeSave]}>
                  <Button
                    className={classes.addEventButton}
                    onClick={() => {
                      setSelectedDateCalendarChanges(initialCalendarChange);
                      setOpenEventDialog(true);
                    }}
                    variant="contained"
                  >
                    {t("Add Event")}
                  </Button>
                </Can>
              )}
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
                        const calendarEvent: CalendarEvent = {
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
                        };
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
              <CalendarView
                calandarChangeDates={calendarChanges}
                fromDate={parseISO(schoolYear?.startDate)}
                toDate={parseISO(schoolYear?.endDate)}
                setSelectedCalendarChanges={input => {
                  pagination.resetPage();
                  setSelectedDateCalendarChanges(input);
                }}
                selectedDate={selectedDate}
                setSelectedDate={input => {
                  pagination.resetPage();
                  setSelectedDate(input);
                }}
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
  addEventButton: {
    marginTop: theme.typography.pxToRem(27),
    zIndex: 1000,
    marginRight: theme.typography.pxToRem(30),
  },
}));

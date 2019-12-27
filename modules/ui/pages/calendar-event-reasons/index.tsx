import { Grid, makeStyles } from "@material-ui/core";
import { useTheme } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { compact } from "lodash-es";
import { EditableTable } from "ui/components/editable-table";
import { PageTitle } from "ui/components/page-title";
import {
  CalendarChangeReasonCreateInput,
  CalendarChangeReasonUpdateInput,
} from "graphql/server-types.gen";
import { Column } from "material-table";
import { useSnackbar } from "hooks/use-snackbar";
import { CreateCalendarChangeReason } from "./graphql/create.gen";
import { CalendarChangeReasonIndexRoute } from "ui/routes/calendar/event-reasons";
import { useRouteParams } from "ui/routes/definition";
import { GetAllCalendarChangeReasonsWithinOrg } from "ui/pages/calendar-event-reasons/graphql/get-calendar-event-reasons.gen";
import { UpdateCalendarChangeReason } from "./graphql/update.gen";
import { DeleteCalendarChangeReason } from "./graphql/delete.gen";
import { CalendarDayTypes } from "reference-data/calendar-day-type";
import { ShowErrors, ShowGenericErrors } from "ui/components/error-helpers";
import { useWorkDayScheduleVariantTypes } from "reference-data/work-day-schedule-variant-types";

type Props = {};

export const CalendarChangeReason: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const [createCalendarChangeReasons] = useMutationBundle(
    CreateCalendarChangeReason,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );
  const [updateCalendarChangeReasons] = useMutationBundle(
    UpdateCalendarChangeReason,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );
  const params = useRouteParams(CalendarChangeReasonIndexRoute);
  const { openSnackbar } = useSnackbar();
  const [includeExpired, setIncludeExpired] = React.useState(false);

  const getCalendarChangeReasons = useQueryBundle(
    GetAllCalendarChangeReasonsWithinOrg,
    {
      variables: { orgId: params.organizationId, includeExpired },
    }
  );

  const orgWorkDayScheduleVariantTypes = useWorkDayScheduleVariantTypes(
    params.organizationId
  );

  const workDayScheduleVariantTypes = orgWorkDayScheduleVariantTypes.reduce(
    (o: any, key: any) => ({ ...o, [key.id]: key.name }),
    {}
  );

  const calendarDayTypes = CalendarDayTypes.reduce(
    (o: any, key: any) => ({ ...o, [key.enumValue]: key.name }),
    {}
  );

  const [deleteCalendarChangeReasonsMutation] = useMutationBundle(
    DeleteCalendarChangeReason,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );
  const deleteCalendarChangeReasons = (calendarChangeReasonId: string) => {
    return deleteCalendarChangeReasonsMutation({
      variables: { calendarChangeReasonId: Number(calendarChangeReasonId) },
    });
  };

  const validateCalendarChangeReason = React.useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string().required(t("Name is required")),
        externalId: Yup.string().nullable(),
        description: Yup.string().nullable(),
        calendarDayTypeId: Yup.string()
          .nullable()
          .required(t("Day Type is required")),
        workDayScheduleVariantId: Yup.string().nullable(),
      }),
    [t]
  );

  const [calendarChangeReason] = React.useState<
    CalendarChangeReasonCreateInput
  >({
    orgId: Number(params.organizationId),
    name: "",
    description: "",
    calendarDayTypeId: null,
    workDayScheduleVariantTypeId: null,
  });

  const create = async (
    calendarChangeReason: CalendarChangeReasonCreateInput
  ) => {
    validateCalendarChangeReason
      .validate(calendarChangeReason, { abortEarly: false })
      .catch(function(err) {
        ShowGenericErrors(err, openSnackbar);
      });
    const result = await createCalendarChangeReasons({
      variables: {
        calendarChangeReason,
      },
    });
    if (result === undefined) return false;
    return true;
  };

  const update = async (
    calendarChangeReason: CalendarChangeReasonUpdateInput
  ) => {
    validateCalendarChangeReason
      .validate(calendarChangeReason, { abortEarly: false })
      .then(() => {})
      .catch(function(err) {
        ShowGenericErrors(err, openSnackbar);
      });
    const result = await updateCalendarChangeReasons({
      variables: {
        calendarChangeReason,
      },
    });
    if (result === undefined) return false;
    return true;
  };

  const columns: Column<GetAllCalendarChangeReasonsWithinOrg.All>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
      editable: "always",
    },
    {
      title: t("Description"),
      field: "description",
      searchable: true,
      hidden: isMobile,
      editable: "always",
    },
    {
      title: t("Applies To"),
      field: "calendarDayTypeId",
      searchable: true,
      hidden: isMobile,
      editable: "always",
      lookup: calendarDayTypes,
    },
    {
      title: t("Work Day Schedule"),
      field: "workDayScheduleVariantTypeId",
      searchable: true,
      hidden: isMobile,
      editable: "always",
      lookup: workDayScheduleVariantTypes,
    },
  ];

  if (getCalendarChangeReasons.state === "LOADING") {
    return <></>;
  }

  const CalendarChangeReasons = compact(
    getCalendarChangeReasons?.data?.orgRef_CalendarChangeReason?.all ?? []
  );
  const mappedData = CalendarChangeReasons.map(o => ({
    ...o,
    externalId: o.externalId?.toString(),
    description: o.description?.toString(),
  }));
  const CalendarChangeReasonsCount = CalendarChangeReasons.length;

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
          <PageTitle title={t("Calendar Event Reasons")} />
        </Grid>
      </Grid>
      <EditableTable
        title={`${CalendarChangeReasonsCount} ${t("Calendar Event Reasons")}`}
        columns={columns}
        data={mappedData}
        onRowAdd={async newData => {
          const newCalendarChangeReason = {
            ...calendarChangeReason,
            name: newData.name,
            description:
              newData.description && newData.description.trim().length === 0
                ? null
                : newData.description,
            workDayScheduleVariantTypeId:
              newData.workDayScheduleVariantTypeId === null
                ? undefined
                : newData.workDayScheduleVariantTypeId,
            calendarDayTypeId: newData.calendarDayTypeId,
          };
          const result = await create(newCalendarChangeReason);
          if (!result) throw Error("Preserve Row on error");
          if (result) await getCalendarChangeReasons.refetch();
        }}
        onRowUpdate={async newData => {
          const updateCalendarChangeReason = {
            id: Number(newData.id),
            rowVersion: newData.rowVersion,
            name: newData.name,
            description:
              newData.description && newData.description.trim().length === 0
                ? null
                : newData.description,
            workDayScheduleVariantTypeId:
              newData.workDayScheduleVariantTypeId === null
                ? undefined
                : newData.workDayScheduleVariantTypeId,
            calendarDayTypeId: newData.calendarDayTypeId,
          };
          const result = await update(updateCalendarChangeReason);
          if (!result) throw Error("Preserve Row on error");
          if (result) await getCalendarChangeReasons.refetch();
        }}
        onRowDelete={async oldData => {
          await deleteCalendarChangeReasons(String(oldData.id));
          getCalendarChangeReasons.refetch();
        }}
        options={{
          search: true,
        }}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(),
  },
}));

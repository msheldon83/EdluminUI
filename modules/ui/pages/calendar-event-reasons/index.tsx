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
import { ShowErrors } from "ui/components/error-helpers";

type Props = {};

export const CalendarChangeReason: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const [createCalendarChangeReasons] = useMutationBundle(
    CreateCalendarChangeReason
  );
  const [updateCalendarChangeReasons] = useMutationBundle(
    UpdateCalendarChangeReason
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
        name: Yup.string()
          .nullable()
          .required(t("Name is required")),
        externalId: Yup.string().nullable(),
        description: Yup.string().nullable(),
      }),
    [t]
  );

  const handleError = (error: any) => {
    openSnackbar({
      message: <div>{t(error.errors[0])}</div>,
      dismissable: true,
      autoHideDuration: 5000,
      status: "error",
    });
  };

  const [calendarChangeReason] = React.useState<
    CalendarChangeReasonCreateInput
  >({
    orgId: Number(params.organizationId),
    name: "",
    description: "",
  });

  const create = async (
    calendarChangeReason: CalendarChangeReasonCreateInput
  ) => {
    validateCalendarChangeReason
      .validate(calendarChangeReason)
      .catch(function(err) {
        handleError(err);
      });
    const result = await createCalendarChangeReasons({
      variables: {
        calendarChangeReason: {
          ...calendarChangeReason,
          description:
            calendarChangeReason.description &&
            calendarChangeReason.description.trim().length === 0
              ? null
              : calendarChangeReason.description,
        },
      },
    });
  };

  const update = async (
    calendarChangeReason: CalendarChangeReasonUpdateInput
  ) => {
    validateCalendarChangeReason
      .validate(calendarChangeReason)
      .catch(function(err) {
        handleError(err);
      });
    const result = await updateCalendarChangeReasons({
      variables: {
        calendarChangeReason: {
          id: Number(calendarChangeReason.id),
          rowVersion: calendarChangeReason.rowVersion,
          name:
            calendarChangeReason.name &&
            calendarChangeReason.name.trim().length === 0
              ? null
              : calendarChangeReason.name,
          description:
            calendarChangeReason.description &&
            calendarChangeReason.description.trim().length === 0
              ? null
              : calendarChangeReason.description,
        },
      },
    });
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
      title: t("Day Type"),
      field: "calendarDayTypeEnum",
      searchable: true,
      hidden: isMobile,
      editable: "always",
    },
    //Add enum drop down
    //Work Day as well
  ];

  if (getCalendarChangeReasons.state === "LOADING") {
    return <></>;
  }

  const CalendarChangeReasons = compact(
    getCalendarChangeReasons?.data?.orgRef_CalendarChangeReason?.all ?? []
  );
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
        data={CalendarChangeReasons}
        onRowAdd={async newData => {
          const newCalendarChangeReason = {
            ...calendarChangeReason,
            name: newData.name,
            description: newData.description,
          };
          await create(newCalendarChangeReason);
          getCalendarChangeReasons.refetch();
        }}
        onRowUpdate={async newData => {
          const updateCalendarChangeReason = {
            id: Number(newData.id),
            rowVersion: newData.rowVersion,
            name: newData.name,
            description: newData.description,
          };
          await update(updateCalendarChangeReason);
          getCalendarChangeReasons.refetch();
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

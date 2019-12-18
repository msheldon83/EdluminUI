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
import { CalendarChangeReasonsIndexRoute } from "ui/routes/calendar/event-reasons";
import { useRouteParams } from "ui/routes/definition";
import { GetAllCalendarChangeReasonsWithinOrg } from "ui/pages/calendar-event-reasons/graphql/get-calendar-event-reasons.gen";
import { UpdateCalendarChangeReason } from "./graphql/update.gen";
import { DeleteCalendarChangeReason } from "./graphql/delete.gen";

type Props = {};

export const CalendarChangeReasons: React.FC<Props> = props => {
  const { t } = useTranslation();
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const [createCalendarChangeReasons] = useMutationBundle(
    CreateCalendarChangeReason
  );
  const [updateCalendarChangeReasons] = useMutationBundle(
    UpdateCalendarChangeReason
  );
  const params = useRouteParams(CalendarChangeReasonsIndexRoute);
  const { openSnackbar } = useSnackbar();
  const [includeExpired, setIncludeExpired] = React.useState(false);

  const getCalendarChangeReasons = useQueryBundle(
    GetAllCalendarChangeReasonsWithinOrg,
    {
      variables: { orgId: params.organizationId, includeExpired },
    }
  );
  const [deleteCalendarChangeReasonsMutation] = useMutationBundle(
    DeleteCalendarChangeReason
  );
  const deleteCalendarChangeReasons = (calendarChangeReasonsId: string) => {
    return deleteCalendarChangeReasonsMutation({
      variables: { calendarChangeReasonsId: Number(calendarChangeReasonsId) },
    });
  };

  const validateCalendarChangeReasons = React.useMemo(
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
    externalId: null,
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
    // const result = await createCalendarChangeReasons({
    //   variables: {
    //     CalendarChangeReasons: {
    //       ...CalendarChangeReasons,
    //       externalId:
    //         CalendarChangeReasons.externalId &&
    //         CalendarChangeReasons.externalId.trim().length === 0
    //           ? null
    //           : CalendarChangeReasons.externalId,
    //       description:
    //         CalendarChangeReasons.description &&
    //         CalendarChangeReasons.description.trim().length === 0
    //           ? null
    //           : CalendarChangeReasons.description,
    //     },
    //   },
    // });
  };

  const update = async (
    CalendarChangeReasons: CalendarChangeReasonUpdateInput
  ) => {
    validateCalendarChangeReasons
      .validate(CalendarChangeReasons)
      .catch(function(err) {
        handleError(err);
      });
    // const result = await updateCalendarChangeReasons({
    //   variables: {
    //     CalendarChangeReasons: {
    //       id: Number(CalendarChangeReasons.id),
    //       rowVersion: CalendarChangeReasons.rowVersion,
    //       name:
    //         CalendarChangeReasons.name &&
    //         CalendarChangeReasons.name.trim().length === 0
    //           ? null
    //           : CalendarChangeReasons.name,
    //       externalId:
    //         CalendarChangeReasons.externalId &&
    //         CalendarChangeReasons.externalId.trim().length === 0
    //           ? null
    //           : CalendarChangeReasons.externalId,
    //       description:
    //         CalendarChangeReasons.description &&
    //         CalendarChangeReasons.description.trim().length === 0
    //           ? null
    //           : CalendarChangeReasons.description,
    //     },
    //   },
    //});
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
      title: t("External Id"),
      field: "externalId",
      searchable: true,
      hidden: isMobile,
      editable: "always",
    },
    {
      title: t("Description"),
      field: "description",
      searchable: true,
      hidden: isMobile,
      editable: "always",
    },
  ];

  if (getCalendarChangeReasons.state === "LOADING") {
    return <></>;
  }

  const CalendarChangeReasons = compact(
    getCalendarChangeReasons?.data?.orgRef_CalendarChangeReasons?.all ?? []
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
            ...CalendarChangeReasons,
            name: newData.name,
            externalId: newData.externalId,
            description: newData.description,
          };
          await create(newCalendarChangeReason);
          getCalendarChangeReasons.refetch();
        }}
        onRowUpdate={async newData => {
          const updateCalendarChangeReasons = {
            id: Number(newData.id),
            rowVersion: newData.rowVersion,
            name: newData.name,
            externalId: newData.externalId,
            description: newData.description,
          };
          await update(updateCalendarChangeReasons);
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

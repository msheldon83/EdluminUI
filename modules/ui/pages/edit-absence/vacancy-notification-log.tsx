import { Grid, makeStyles } from "@material-ui/core";
import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { Column } from "material-table";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Table } from "ui/components/table";
import { GetNotificationLogForVacancy } from "./graphql/get-notification-log.gen";
import { useRouteParams } from "ui/routes/definition";
import { VacancyNotificationLogRoute } from "ui/routes/notification-log";
import { parseISO, format, addMinutes } from "date-fns";
import { getDisplayName } from "ui/components/enumHelpers";

export const VacancyNotificationLogIndex: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const params = useRouteParams(VacancyNotificationLogRoute);

  const timeZoneOffset = useMemo(() => new Date().getTimezoneOffset(), []);

  const getNotificationLog = useQueryBundle(GetNotificationLogForVacancy, {
    variables: { vacancyId: params.vacancyId },
  });

  const columns: Column<
    GetNotificationLogForVacancy.VacancyNotificationLogByVacancy
  >[] = [
    {
      title: t("Name"),
      render: data => {
        return `${data.employee.firstName} ${data.employee.lastName}`;
      },
    },
    {
      title: t("Sent at"),
      render: data => {
        if (data.sentAtUtc) {
          return format(
            addMinutes(parseISO(data.sentAtUtc), timeZoneOffset),
            "MMM d, h:mm a"
          );
        } else {
          return t("Not sent");
        }
      },
    },
    {
      title: t("Status As Of"),
      render: data => {
        if (data.statusAsOfUtc) {
          return format(
            addMinutes(parseISO(data.statusAsOfUtc), timeZoneOffset),
            "MMM d, h:mm a"
          );
        } else {
          return format(
            addMinutes(parseISO(data.createdUtc), timeZoneOffset),
            "MMM d, h:mm a"
          );
        }
      },
    },
    {
      title: t("Status"),
      render: data => {
        if (data.notificationMessageStatus) {
          return getDisplayName(
            "notificationMessageStatus",
            data.notificationMessageStatus,
            t
          );
        } else {
          return t("No status");
        }
      },
    },
    {
      title: t("Replied at"),
      render: data => {
        if (data.repliedAtUtc) {
          return format(
            addMinutes(parseISO(data.repliedAtUtc), timeZoneOffset),
            "MMM d, h:mm a"
          );
        } else {
          return t("No reply");
        }
      },
    },
    {
      title: t("Response"),
      render: data => {
        if (data.jobNotificationResponse) {
          return getDisplayName(
            "jobNotificationResponse",
            data.jobNotificationResponse,
            t
          );
        } else {
          return t("No response");
        }
      },
    },
  ];

  if (getNotificationLog.state === "LOADING") {
    return <></>;
  }

  const notifications = compact(
    getNotificationLog?.data?.vacancy?.vacancyNotificationLogByVacancy ?? []
  );
  const notificationsCount = notifications.length;

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
          <PageTitle
            title={`${t("Notification Log for ")} ${params.vacancyId}`}
          />
        </Grid>
      </Grid>
      <Table
        title={`${notificationsCount} ${t("Log records")}`}
        columns={columns}
        data={notifications}
        selection={false}
        options={{
          search: false,
        }}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(),
  },
}));

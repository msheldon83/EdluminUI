import { Button, Grid, makeStyles, InputLabel } from "@material-ui/core";
import { usePagedQueryBundle, useQueryBundle } from "graphql/hooks";
import { useIsMobile } from "hooks";
import { compact } from "lodash-es";
import { Column } from "material-table";
import * as React from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { PageTitle } from "ui/components/page-title";
import { Table } from "ui/components/table";
import { GetNotificationLogForUser } from "./graphql/get-notification-log.gen";
import { useRouteParams } from "ui/routes/definition";
import { UserNotificationLogRoute } from "ui/routes/notification-log";
import { AdminEditAbsenceRoute } from "ui/routes/edit-absence";
import { parseISO, format, addMinutes, addDays } from "date-fns";
import { getDisplayName } from "ui/components/enumHelpers";
import { GetUserById } from "./graphql/get-user-by-id.gen";
import { Section } from "ui/components/section";
import { DatePicker } from "ui/components/form/date-picker";

export const UserNotificationLogIndex: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const isMobile = useIsMobile();
  const params = useRouteParams(UserNotificationLogRoute);

  const today = useMemo(() => new Date(), []);
  const [fromDate, setFromDate] = useState<Date | string>(addDays(today, -7));
  const [toDate, setToDate] = useState<Date | string>(today);

  const timeZoneOffset = useMemo(() => new Date().getTimezoneOffset(), []);

  const getUser = useQueryBundle(GetUserById, {
    variables: { id: params.userId },
  });

  const user =
    getUser.state === "LOADING" ? undefined : getUser?.data?.user?.byId;

  const [getNotificationLog, pagination] = usePagedQueryBundle(
    GetNotificationLogForUser,
    r => r.vacancy?.vacancyNotificationLogByUser?.totalCount,
    {
      variables: { userId: params.userId, fromDate: fromDate, toDate: toDate },
    }
  );

  const columns: Column<GetNotificationLogForUser.Results>[] = [
    {
      title: t("AbsenceId"),
      render: data => {
        return (
          <Link
            to={AdminEditAbsenceRoute.generate({
              absenceId: data.vacancy.absenceId ?? "",
              organizationId: data.orgId,
            })}
          >
            {`#${data.vacancy.absenceId}`}
          </Link>
        );
      },
    },
    {
      title: t("Organization"),
      field: "organization.name",
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
    getNotificationLog?.data?.vacancy?.vacancyNotificationLogByUser?.results ??
      []
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
          <PageTitle title={t("Notification Log for")} />
          <div
            className={classes.subHeader}
          >{`${user?.firstName} ${user?.lastName}`}</div>
          <div className={classes.subHeader}>{user?.formattedPhone}</div>
        </Grid>
      </Grid>
      <Section>
        <Grid container>
          <Grid item xs={isMobile ? 6 : 2}>
            <InputLabel>{t("From")}</InputLabel>
            <DatePicker
              variant={"single-hidden"}
              startDate={fromDate}
              onChange={({ startDate }) => setFromDate(startDate)}
            />
          </Grid>
          <Grid item xs={isMobile ? 6 : 2}>
            <InputLabel>{t("To")}</InputLabel>
            <DatePicker
              variant={"single-hidden"}
              startDate={toDate}
              onChange={({ startDate }) => setToDate(startDate)}
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
          pagination={pagination}
        />
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(),
  },
  subHeader: {
    fontSize: theme.typography.pxToRem(24),
    fontWeight: "bold",
  },
}));

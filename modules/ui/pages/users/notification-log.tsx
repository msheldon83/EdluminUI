import { Grid, makeStyles, InputLabel } from "@material-ui/core";
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
import { AdminEditAbsenceRoute } from "ui/routes/absence";
import { VacancyNotificationLogRoute } from "ui/routes/notification-log";
import { AbsenceVacancyNotificationLogRoute } from "ui/routes/notification-log";
import { format, addDays } from "date-fns";
import { getDisplayName } from "ui/components/enumHelpers";
import { GetUserById } from "./graphql/get-user-by-id.gen";
import { Section } from "ui/components/section";
import { DatePicker } from "ui/components/form/date-picker";
import { VacancyViewRoute } from "ui/routes/vacancy";

export const UserNotificationLogIndex: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const params = useRouteParams(UserNotificationLogRoute);

  const today = useMemo(() => new Date(), []);
  const [fromDate, setFromDate] = useState<Date | string>(addDays(today, -7));
  const [toDate, setToDate] = useState<Date | string>(today);

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
      title: t("Id"),
      render: data => {
        return (
          <>
            <div>
              <Link
                to={
                  data.vacancy.absenceId
                    ? AdminEditAbsenceRoute.generate({
                        absenceId: data.vacancy.absenceId ?? "",
                        organizationId: data.orgId,
                      })
                    : VacancyViewRoute.generate({
                        vacancyId: data.vacancy.id,
                        organizationId: data.orgId,
                      })
                }
              >
                {data.vacancy.absenceId
                  ? `#${data.vacancy.absenceId}`
                  : `#V${data.vacancy.id}`}
              </Link>
            </div>
            <div>
              <Link
                to={
                  data.vacancy.absenceId
                    ? AbsenceVacancyNotificationLogRoute.generate({
                        organizationId: data.orgId,
                        vacancyId: data.vacancyId ?? "",
                      })
                    : VacancyNotificationLogRoute.generate({
                        organizationId: data.orgId,
                        vacancyId: data.vacancyId ?? "",
                      })
                }
              >
                {t("Log")}
              </Link>
            </div>
          </>
        );
      },
    },
    {
      title: t("Organization"),
      field: "organization.name",
    },
    {
      title: t("Record Created"),
      render: data => {
        if (data.createdUtc) {
          return format(new Date(data.createdUtc), "MMM d, h:mm:ss a");
        } else {
          return t("Not available");
        }
      },
    },
    {
      title: t("Sent at"),
      render: data => {
        if (data.sentAtUtc) {
          return format(new Date(data.sentAtUtc), "MMM d, h:mm:ss a");
        } else {
          return t("Not sent");
        }
      },
    },
    {
      title: t("Status As Of"),
      render: data => {
        if (data.statusAsOfUtc) {
          return format(new Date(data.statusAsOfUtc), "MMM d, h:mm:ss a");
        } else {
          return t("No status");
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
      title: t("Type"),
      render: data => {
        if (data.notificationMethod) {
          return getDisplayName(
            "notificationMethod",
            data.notificationMethod,
            t
          );
        } else {
          return t("No type found");
        }
      },
    },
    {
      title: t("Replied at"),
      render: data => {
        if (data.repliedAtUtc) {
          return format(new Date(data.repliedAtUtc), "MMM d, h:mm:ss a");
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
  const notificationsCount = pagination.totalCount;

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
            title={`${t("Notification Log for")} ${user?.firstName} ${
              user?.lastName
            }`}
          />
          <div className={classes.subHeader}>{user?.formattedPhone}</div>
          <div>
            {t(
              "This is a log of text messages sent to a user informing them of an available job they can accept.  It does not include any reponses we sent back after they replied, initial welcome text, or notifications about being assigned or removed from a job."
            )}
          </div>
        </Grid>
      </Grid>
      <Section>
        <Grid container>
          <Grid item xs={isMobile ? 6 : 2}>
            <InputLabel>{t("From")}</InputLabel>
            <DatePicker
              variant={"single-hidden"}
              startDate={fromDate}
              onChange={({ startDate }) => {
                pagination.resetPage();
                setFromDate(startDate);
              }}
            />
          </Grid>
          <Grid item xs={isMobile ? 6 : 2}>
            <InputLabel>{t("To")}</InputLabel>
            <DatePicker
              variant={"single-hidden"}
              startDate={toDate}
              onChange={({ startDate }) => {
                pagination.resetPage();
                setToDate(startDate);
              }}
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

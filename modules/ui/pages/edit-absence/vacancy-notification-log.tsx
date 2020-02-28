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
import { format } from "date-fns";
import { getDisplayName } from "ui/components/enumHelpers";
import { Link } from "react-router-dom";
import { AdminEditAbsenceRoute } from "ui/routes/edit-absence";

export const VacancyNotificationLogIndex: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const params = useRouteParams(VacancyNotificationLogRoute);

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
            title={`${t("Notification Log for VacancyId")}: ${
              params.vacancyId
            }`}
          />
          <div>
            <Link
              to={AdminEditAbsenceRoute.generate({
                absenceId: params.absenceId ?? "",
                organizationId: params.organizationId,
              })}
            >
              {`Return to Absence #${params.absenceId}`}
            </Link>
          </div>
          <div>
            {t(
              "This is a log of text messages sent to a user informing them of an available job they can accept.  It does not include any reponses we sent back after they replied, or any other notifications about this vacancy being assigned or unassigned."
            )}
          </div>
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

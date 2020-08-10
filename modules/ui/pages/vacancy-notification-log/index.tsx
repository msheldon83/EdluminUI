import { Grid, makeStyles } from "@material-ui/core";
import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { Column } from "material-table";
import * as React from "react";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { Table } from "ui/components/table";
import { GetNotificationLogForVacancy } from "./graphql/get-notification-log.gen";
import { useRouteParams } from "ui/routes/definition";
import { VacancyNotificationLogRoute } from "ui/routes/notification-log";
import { format } from "date-fns";
import { getDisplayName } from "ui/components/enumHelpers";
import { VacancyViewRoute } from "ui/routes/vacancy";
import { AdminEditAbsenceRoute } from "ui/routes/absence";
import { AbsenceVacancyHeader } from "ui/components/absence-vacancy/header";
import { GetVacancyById } from "./graphql/get-vacancy-byid.gen";
import { useMyUserAccess } from "reference-data/my-user-access";
import { EmployeeLink } from "ui/components/links/people";

export const VacancyNotificationLogIndex: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const params = useRouteParams(VacancyNotificationLogRoute);
  const history = useHistory();

  const getNotificationLog = useQueryBundle(GetNotificationLogForVacancy, {
    variables: { vacancyId: params.vacancyId },
  });

  const getVacancy = useQueryBundle(GetVacancyById, {
    variables: { id: params.vacancyId },
  });

  const vacancy =
    getVacancy.state !== "LOADING" ? getVacancy?.data?.vacancy?.byId : null;
  const isNormalVacancy = vacancy?.isNormalVacancy;

  const headerId = isNormalVacancy
    ? `#V${vacancy?.id}`
    : `#${vacancy?.absenceId}`;

  const subHeader = isNormalVacancy ? (
    vacancy?.position?.title
  ) : (
    <EmployeeLink orgUserId={vacancy?.absence?.employee?.id} color="black">
      {`${vacancy?.absence?.employee?.firstName} ${vacancy?.absence?.employee?.lastName}`}
    </EmployeeLink>
  );

  const onReturn = () => {
    if (isNormalVacancy) {
      history.push(VacancyViewRoute.generate(params));
    } else {
      history.push(
        AdminEditAbsenceRoute.generate({
          absenceId: vacancy?.absenceId ?? "",
          organizationId: params.organizationId,
        })
      );
    }
  };

  const userAccess = useMyUserAccess();
  const isSysAdmin = userAccess?.isSysAdmin;

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
      title: isSysAdmin ? t("Record Created") : t("Sent"),
      render: data => {
        if (data.createdUtc) {
          return format(new Date(data.createdUtc), "MMM d, h:mm:ss a");
        } else {
          return t("Not available");
        }
      },
    },
    {
      title: t("Actually Sent At"),
      render: data => {
        if (data.sentAtUtc) {
          return format(new Date(data.sentAtUtc), "MMM d, h:mm:ss a");
        } else {
          return t("Not sent");
        }
      },
      hidden: !isSysAdmin,
    },
    {
      title: t("Status As Of"),
      render: data => {
        if (data.statusAsOfUtc) {
          return format(new Date(data.statusAsOfUtc), "MMM d, h:mm:ss a");
        } else {
          return t("Pending");
        }
      },
      hidden: !isSysAdmin,
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
          return t("Pending");
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
          <AbsenceVacancyHeader
            subHeader={subHeader}
            pageHeader={`${t("Notification log")} ${headerId}`}
            onCancel={onReturn}
            isForVacancy={isNormalVacancy}
          />
          <div className={classes.infoText}>
            {t(
              "This log currently includes only messages informing users that this assignment is available. It does not include responses, assignment notifications, or cancellation notifications."
            )}
          </div>
        </Grid>
      </Grid>
      <Table
        title={`${notificationsCount} ${
          notificationsCount === 1 ? t("record") : t("records")
        }`}
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
  infoText: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

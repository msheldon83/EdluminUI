import { Grid, makeStyles, InputLabel } from "@material-ui/core";
import { usePagedQueryBundle, useQueryBundle } from "graphql/hooks";
import { useIsMobile } from "hooks";
import { compact } from "lodash-es";
import { Column } from "material-table";
import * as React from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Table } from "ui/components/table";
import { GetSmsLogForUser } from "./graphql/get-sms-log.gen";
import { useRouteParams } from "ui/routes/definition";
import { UserSmsLogRoute } from "ui/routes/sms-log";
import { format, addDays } from "date-fns";
import { getDisplayName } from "ui/components/enumHelpers";
import { GetUserById } from "./graphql/get-user-by-id.gen";
import { Section } from "ui/components/section";
import { DatePicker } from "ui/components/form/date-picker";

type Props = {};

export const SmsLogIndex: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const params = useRouteParams(UserSmsLogRoute);

  const today = useMemo(() => new Date(), []);
  const [fromDate, setFromDate] = useState<Date | string>(addDays(today, -7));
  const [toDate, setToDate] = useState<Date | string>(today);

  const getUser = useQueryBundle(GetUserById, {
    variables: { id: params.userId },
  });

  const user =
    getUser.state === "LOADING" ? undefined : getUser?.data?.user?.byId;

  //Changed to Text Messages
  const [getSmsLog, pagination] = usePagedQueryBundle(GetSmsLogForUser, {
    variables: {
      userId: params.userId,
      fromDateTime: fromDate,
      toDateTime: toDate,
    },
  });

  const columns: Column<GetSmsLogForUser.EmployeeSmsLogLocal>[] = [
    {
      title: t("Created Local"),
      render: data => {
        if (data.createdLocal) {
          return format(new Date(data.createdLocal), "MMM d, h:mm:ss a");
        } else {
          return t("Not available");
        }
      },
    },
    {
      title: t("Body"),
      render: data => {
        if (data.body) {
          return getDisplayName("body", data.body, t);
        } else {
          return t("No body");
        }
      },
    },
    {
      title: t("Status"),
      render: data => {
        if (data.status) {
          return getDisplayName("status", data.status, t);
        } else {
          return t("No status");
        }
      },
    },
    // {
    //   title: t("Replied at"),
    //   render: data => {
    //     if (data.repliedAtUtc) {
    //       return format(new Date(data.repliedAtUtc), "MMM d, h:mm:ss a");
    //     } else {
    //       return t("No reply");
    //     }
    //   },
    // },
    // {
    //   title: t("Response"),
    //   render: data => {
    //     if (data.jobNotificationResponse) {
    //       return getDisplayName(
    //         "jobNotificationResponse",
    //         data.jobNotificationResponse,
    //         t
    //       );
    //     } else {
    //       return t("No response");
    //     }
    //   },
    // },
  ];

  if (getSmsLog.state === "LOADING") {
    return <></>;
  }

  const sms = compact(
    getSmsLog?.data?.employee?.employeeSmsLogLocal?.results ?? []
  );
  const smsCount = pagination.totalCount;

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
            title={`${t("Sms Log for")} ${user?.firstName} ${user?.lastName}`}
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
          title={`${smsCount} ${t("Log records")}`}
          columns={columns}
          data={sms}
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

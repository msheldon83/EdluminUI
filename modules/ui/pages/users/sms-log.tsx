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
import { addDays } from "date-fns";
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

  const [getSmsLog, pagination] = usePagedQueryBundle(
    GetSmsLogForUser,
    r => r.employee?.employeeSmsLogLocal?.totalCount,
    {
      variables: {
        userId: params.userId,
        fromTime: fromDate,
        toTime: toDate,
      },
    }
  );
  const columns: Column<GetSmsLogForUser.Results>[] = [
    {
      title: t("Date"),
      defaultSort: "asc",
      sorting: false,
      field: "createdLocal",
      render: d => {
        const value = Date.parse(d.createdLocal);
        return new Date(value).toLocaleDateString();
      },
    },
    {
      title: t("Time"),
      defaultSort: "asc",
      sorting: false,
      field: "createdLocal",
      render: d => {
        const clearSeconds = new Date(Date.parse(d.createdLocal));
        return new Date(clearSeconds).toLocaleTimeString();
      },
    },
    {
      title: t("Body"),
      field: "body",
      sorting: false,
      searchable: false,
      hidden: isMobile,
    },
    {
      title: t("From Phone"),
      field: "fromPhone",
      sorting: false,
      searchable: false,
      hidden: isMobile,
    },
    {
      title: t("To Phone"),
      field: "toPhone",
      sorting: false,
      searchable: false,
      hidden: isMobile,
    },
    {
      title: t("Status"),
      sorting: false,
      render: d => {
        if (d.status)
          return d.status.charAt(0).toUpperCase() + d.status.slice(1);
        else return t("No Status");
      },
    },
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
              "This is a log of incoming & outgoing text messages sent to the user within a date range."
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

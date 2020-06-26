import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import LaunchIcon from "@material-ui/icons/Launch";
import { useTranslation } from "react-i18next";
import { AdminHomeRoute } from "ui/routes/admin-home";
import { useRouteParams } from "ui/routes/definition";
import { DailyReport } from "ui/components/reports/daily-report/daily-report";
import {
  startOfToday,
  getHours,
  startOfTomorrow,
  isSameDay,
  format,
} from "date-fns";
import { Grid, Button, Tooltip } from "@material-ui/core";
import { DateStepperHeader } from "ui/components/date-stepper-header";
import { useMemo, useState, useEffect } from "react";
import { useQueryBundle, HookQueryResult } from "graphql/hooks";
import {
  GetMyUserAccess,
  GetMyUserAccessQuery,
  GetMyUserAccessQueryVariables,
} from "reference-data/get-my-user-access.gen";
import { TFunction } from "i18next";
import { Link } from "react-router-dom";
import { DailyReportRoute } from "ui/routes/absence-vacancy/daily-report";
import { CardType } from "ui/components/reports/daily-report/helpers";
import { useQueryParamIso } from "hooks/query-params";
import { FilterQueryParams } from "ui/components/reports/daily-report/filters/filter-params";
import { SubSignInRoute } from "ui/routes/sub-sign-in";
import { Can } from "ui/components/auth/can";
import { PermissionEnum, FeatureFlag } from "graphql/server-types.gen";
import { useLocation } from "react-router";
import { AppConfig } from "hooks/app-config";
import { useOrgFeatureFlags } from "reference-data/org-feature-flags";
import { ContractScheduleWarning } from "ui/components/contract-schedule/contract-schedule-warning";
import { ApprovalCountBanner } from "ui/components/absence-vacancy/approval-state/admin-count-banner";

type Props = {};

export const AdminHome: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const params = useRouteParams(AdminHomeRoute);
  const [filters] = useQueryParamIso(FilterQueryParams);
  const [date, setDate] = useState(new Date(filters.date));
  const location = useLocation();
  const [selectedCard, setSelectedCard] = useState<CardType>("unfilled");
  const dailyReportRouteParams = useRouteParams(DailyReportRoute);

  const orgFeatureFlags = useOrgFeatureFlags(params.organizationId);
  const orgUsesVerify: boolean = orgFeatureFlags.includes(FeatureFlag.Verify);
  const availableCards: CardType[] = orgUsesVerify
    ? ["unfilled", "total", "awaitingVerification"]
    : ["unfilled", "total"];

  const dateFromFilter = useMemo(() => {
    return new Date(filters.date);
  }, [filters.date]);

  const getUserName = useQueryBundle(GetMyUserAccess, {
    fetchPolicy: "cache-first",
  });
  const salutation = useMemo(() => {
    return getSalutation(getUserName, t);
  }, [getUserName, t]);

  // On load make sure the right data is
  // being shown based on the timeOfDay
  useEffect(() => {
    if (location.search === "" && getTimeOfDay() === "evening") {
      setDate(startOfTomorrow());
    } else if (location.search === "") {
      setDate(new Date());
    }
  }, [location]);

  const subSignInUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("location", "");
    params.set("date", format(date, "P"));
    return `${SubSignInRoute.generate({
      organizationId: dailyReportRouteParams.organizationId,
    })}?${params.toString()}`;
  }, [date, dailyReportRouteParams.organizationId]);

  return (
    <AppConfig contentWidth="100%">
      <Grid
        container
        justify="space-between"
        alignItems="center"
        className={classes.header}
      >
        <Grid item>
          <DateStepperHeader
            date={dateFromFilter}
            setDate={setDate}
          ></DateStepperHeader>
        </Grid>
        <Grid item className={classes.actions}>
          <Button
            variant="outlined"
            component={Link}
            to={subSignInUrl}
            className={classes.button}
            target={"_blank"}
          >
            <LaunchIcon className={classes.signinIcon} />
            {t("Sub Sign-in ")}
          </Button>
          <Button
            variant="outlined"
            component={Link}
            to={DailyReportRoute.generate(dailyReportRouteParams)}
            className={classes.button}
          >
            {t("Daily Report")}
          </Button>
        </Grid>
      </Grid>
      <Can do={[PermissionEnum.FinanceSettingsSave]}>
        <ContractScheduleWarning orgId={params.organizationId} />
      </Can>
      <ApprovalCountBanner orgId={params.organizationId} />
      <Can do={[PermissionEnum.AbsVacVerify]}>
        <DailyReport
          orgId={params.organizationId}
          date={date}
          setDate={setDate}
          header={salutation}
          showFilters={false}
          cards={availableCards}
          selectedCard={selectedCard}
          isHomePage={true}
        />
      </Can>
      <Can not do={[PermissionEnum.AbsVacVerify]}>
        <DailyReport
          orgId={params.organizationId}
          date={date}
          setDate={setDate}
          header={salutation}
          showFilters={false}
          cards={["unfilled", "total"]}
          selectedCard={selectedCard}
          isHomePage={true}
        />
      </Can>
    </AppConfig>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(3),
  },
  button: {
    marginLeft: theme.spacing(),
  },
  signinIcon: {
    marginRight: "5px",
    width: theme.typography.pxToRem(16),
  },
  actions: {
    "@media print": {
      display: "none",
    },
  },
}));

const getSalutation = (
  queryResult: HookQueryResult<
    GetMyUserAccessQuery,
    GetMyUserAccessQueryVariables
  >,
  t: TFunction
) => {
  const timeOfDay = getTimeOfDay();
  const firstName =
    queryResult.state === "LOADING"
      ? undefined
      : queryResult.data?.userAccess?.me?.user?.firstName;

  let salutation = undefined;
  switch (timeOfDay) {
    case "morning":
      salutation = t("Good morning");
      break;
    case "afternoon":
      salutation = t("Good afternoon");
      break;
    case "evening":
      salutation = t("Good evening");
      break;
  }

  return firstName ? `${salutation}, ${firstName}` : salutation;
};

type TimeOfDay = "morning" | "afternoon" | "evening";

const getTimeOfDay = (): TimeOfDay => {
  const now = new Date();
  const currentHour = getHours(now);

  if (currentHour < 12) {
    return "morning";
  }

  if (currentHour >= 12 && currentHour < 15) {
    return "afternoon";
  }

  return "evening";
};

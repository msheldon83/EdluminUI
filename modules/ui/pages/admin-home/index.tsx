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

type Props = {};

export const AdminHome: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const params = useRouteParams(AdminHomeRoute);
  const [filters] = useQueryParamIso(FilterQueryParams);
  const [date, setDate] = useState(new Date(filters.date));
  // If there is a mismatch between dates, then we should be
  // using the date coming from the querystring filters
  // so defaulting to "morning" maintains that
  const [timeOfDay, setTimeOfDay] = useState(
    isSameDay(new Date(filters.date), startOfToday())
      ? getTimeOfDay()
      : "morning"
  );
  const [selectedCard, setSelectedCard] = useState<CardType>("unfilled");
  const dailyReportRouteParams = useRouteParams(DailyReportRoute);

  const getUserName = useQueryBundle(GetMyUserAccess, {
    fetchPolicy: "cache-first",
  });
  const salutation = useMemo(() => {
    return getSalutation(getUserName, t);
  }, [getUserName, t]);

  // On load make sure the right data is
  // being shown based on the timeOfDay

  useEffect(() => {
    if (timeOfDay === "morning") {
      setSelectedCard("unfilled");
    } else if (timeOfDay === "afternoon") {
      setSelectedCard("awaitingVerification");
    } else if (timeOfDay === "evening") {
      setDate(startOfTomorrow());
      setSelectedCard("unfilled");
    }
  }, [timeOfDay]);

  /* This is purely to support the "Toggle Time of Day" button
      in Dev for testing. In Prod we'll only be setting the 
      timeOfDay once when the page loads.
  */
  const toggleTimeOfDay = () => {
    if (!__DEV__) {
      return;
    }

    let newTimeOfDay: TimeOfDay = "morning";
    if (timeOfDay === "morning") {
      newTimeOfDay = "afternoon";
    } else if (timeOfDay === "afternoon") {
      newTimeOfDay = "evening";
    }
    setTimeOfDay(newTimeOfDay);

    if (newTimeOfDay === "morning") {
      setDate(startOfToday());
      setSelectedCard("unfilled");
    } else if (newTimeOfDay === "afternoon") {
      setDate(startOfToday());
      setSelectedCard("awaitingVerification");
    } else if (newTimeOfDay === "evening") {
      setDate(startOfTomorrow());
      setSelectedCard("unfilled");
    }
  };

  const subSignInUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("location", "");
    params.set("date", format(date, "P"));
    return `${SubSignInRoute.generate({
      organizationId: dailyReportRouteParams.organizationId,
    })}?${params.toString()}`;
  }, [date, dailyReportRouteParams.organizationId]);

  return (
    <>
      <Grid
        container
        justify="space-between"
        alignItems="center"
        className={classes.header}
      >
        <Grid item>
          <DateStepperHeader date={date} setDate={setDate}></DateStepperHeader>
        </Grid>
        <Grid item className={classes.actions}>
          {getDevViewToggle(toggleTimeOfDay, timeOfDay)}
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
      <DailyReport
        orgId={params.organizationId}
        date={date}
        setDate={setDate}
        header={salutation}
        showFilters={false}
        cards={["unfilled", "total", "awaitingVerification"]}
        selectedCard={selectedCard}
        isHomePage={true}
      />
    </>
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

const getDevViewToggle = (
  toggleTimeOfDay: () => void,
  currentTimeOfDay: TimeOfDay
) => {
  return (
    __DEV__ && (
      <Tooltip title={`Currently ${currentTimeOfDay}`}>
        <Button variant="contained" color="secondary" onClick={toggleTimeOfDay}>
          Toggle Time Of Day
        </Button>
      </Tooltip>
    )
  );
};

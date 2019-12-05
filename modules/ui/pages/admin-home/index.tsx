import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { AdminHomeRoute } from "ui/routes/admin-home";
import { useRouteParams } from "ui/routes/definition";
import { DailyReport } from "ui/components/reports/daily-report/daily-report";
import { startOfToday, getHours, startOfTomorrow } from "date-fns";
import { Grid, Button, Tooltip } from "@material-ui/core";
import { DateStepperHeader } from "ui/components/date-stepper-header";
import { useMemo, useState, useEffect } from "react";
import { useQueryBundle, HookQueryResult } from "graphql/hooks";
import {
  GetUserName,
  GetUserNameQuery,
  GetUserNameQueryVariables,
} from "./graphql/get-user-name.gen";
import { TFunction } from "i18next";
import { Link } from "react-router-dom";
import { DailyReportRoute } from "ui/routes/absence-vacancy/daily-report";
import { CardType } from "ui/components/reports/daily-report/helpers";

type Props = {};

export const AdminHome: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const params = useRouteParams(AdminHomeRoute);
  const [date, setDate] = useState(startOfToday());
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());
  const [selectedCard, setSelectedCard] = useState<CardType>("unfilled");

  const dailyReportRouteParams = useRouteParams(DailyReportRoute);
  const getUserName = useQueryBundle(GetUserName, {
    fetchPolicy: "cache-first",
  });
  const salutation = getSalutation(timeOfDay, getUserName, t);

  useEffect(() => {
    if (timeOfDay === "morning") {
      setDate(startOfToday());
      setSelectedCard("unfilled");
    }
    if (timeOfDay === "afternoon") {
      setSelectedCard("awaitingVerification");
    }
    if (timeOfDay === "evening") {
      setDate(startOfTomorrow());
      setSelectedCard("unfilled");
    }
  }, [timeOfDay]);

  const toggleTimeOfDay = () => {
    let newTimeOfDay: TimeOfDay = "morning";
    if (timeOfDay === "morning") {
      newTimeOfDay = "afternoon";
    } else if (timeOfDay === "afternoon") {
      newTimeOfDay = "evening";
    }
    setTimeOfDay(newTimeOfDay);
  };

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
            to={DailyReportRoute.generate(dailyReportRouteParams)}
            className={classes.dailyReportButton}
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
  dailyReportButton: {
    marginLeft: theme.spacing(),
  },
  actions: {
    "@media print": {
      display: "none",
    },
  },
}));

const getSalutation = (
  timeOfDay: TimeOfDay,
  queryResult: HookQueryResult<GetUserNameQuery, GetUserNameQueryVariables>,
  t: TFunction
) => {
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

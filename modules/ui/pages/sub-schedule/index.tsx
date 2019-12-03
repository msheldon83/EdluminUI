import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { QueryOrgUsers } from "ui/pages/sub-home/graphql/get-orgusers.gen";
import { PageHeader } from "ui/components/page-header";
import { PageTitle } from "ui/components/page-title";
import {
  Typography,
  Grid,
  Divider,
  IconButton,
  Button,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { makeStyles } from "@material-ui/styles";
import ListIcon from "@material-ui/icons/List";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import { CalendarView } from "./calendar-view";
import { Link } from "react-router-dom";
import {
  SubScheduleCalendarViewRoute,
  SubScheduleListViewRoute,
  SubScheduleRoute,
} from "ui/routes/sub-schedule";
import { useRouteParams } from "ui/routes/definition";

type Props = {
  view: "list" | "calendar";
};

export const SubSchedule: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(SubScheduleRoute);
  const getOrgUsers = useQueryBundle(QueryOrgUsers, {
    fetchPolicy: "cache-first",
  });

  const userId =
    getOrgUsers.state === "LOADING" || getOrgUsers.state === "UPDATING"
      ? undefined
      : getOrgUsers.data?.userAccess?.me?.user?.id;

  return (
    <>
      <PageTitle title="My Schedule" withoutHeading />

      <Typography variant="h5">{t("My Schedule")}</Typography>
      <Typography variant="h1">2019-2020</Typography>

      <Section>
        <Grid container justify="space-between">
          <Grid item>
            {/* check route to determine what to show */}
            <Typography variant="h5">{t("Upcoming 12 months")}</Typography>
          </Grid>

          {/* check route to determine selected */}
          <Grid item>
            <div className={classes.d}>
              <Link to={SubScheduleListViewRoute.generate(params)}>
                <ListIcon fontSize={"small"} />
                <Typography className={classes.buttonText}>
                  {t("List View")}
                </Typography>
              </Link>
            </div>
            <div className={[classes.d, classes.selected].join(" ")}>
              {/* <Button  color="inherit" startIcon={<CalendarTodayIcon fontSize={"small"} />} >
                <Typography className={classes.buttonText}>
                  {t("Calendar View")}
                </Typography>
              </Button> */}
              <Link to={SubScheduleCalendarViewRoute.generate(params)}>
                <CalendarTodayIcon fontSize={"small"} />
                <Typography className={classes.buttonText}>
                  {t("Calendar View")}
                </Typography>
              </Link>
            </div>
          </Grid>
        </Grid>

        <Grid container item>
          <Divider />
        </Grid>

        {/* Either list or calendar view */}
        {props.view === "calendar" && <CalendarView />}
        {props.view === "list" && <div>LIST</div>}
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  d: {
    display: "inline-flex",
    margin: theme.spacing(1),
    color: theme.customColors.edluminSubText,
  },
  buttonText: {
    textTransform: "uppercase",
    fontWeight: 500,
  },
  selected: {
    color: theme.customColors.blue,
  },
}));

import { Typography } from "@material-ui/core";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import ListIcon from "@material-ui/icons/List";
import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useRouteParams } from "ui/routes/definition";
import {
  SubScheduleListViewRoute,
  SubScheduleRoute,
} from "ui/routes/sub-schedule";

type Props = {
  view: "list" | "calendar";
  calendarViewRoute: string;
  listViewRoute: string;
};

export const ScheduleViewToggle: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(SubScheduleRoute);
  const f = SubScheduleListViewRoute.generate(params);
  return (
    <>
      <div className={classes.option}>
        <Link
          to={props.listViewRoute}
          className={`${classes.option} ${
            props.view === "list" ? classes.selected : ""
          }`}
        >
          <ListIcon fontSize={"small"} />
          <Typography className={classes.buttonText}>
            {t("List View")}
          </Typography>
        </Link>
      </div>
      <div className={classes.option}>
        <Link
          to={props.calendarViewRoute}
          className={`${classes.option} ${
            props.view === "calendar" ? classes.selected : ""
          }`}
        >
          <CalendarTodayIcon fontSize={"small"} />
          <Typography className={classes.buttonText}>
            {t("Calendar View")}
          </Typography>
        </Link>
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  option: {
    display: "inline-flex",
    margin: theme.spacing(1),
    color: theme.customColors.edluminSubText,
    textDecoration: "none",
  },
  buttonText: {
    paddingLeft: theme.spacing(1),
    textTransform: "uppercase",
    fontWeight: 500,
  },
  selected: {
    color: theme.customColors.blue,
  },
}));

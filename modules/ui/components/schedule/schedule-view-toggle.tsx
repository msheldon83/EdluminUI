import { Typography } from "@material-ui/core";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import ListIcon from "@material-ui/icons/List";
import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useIsMobile } from "hooks";
import { useLocation } from "react-router";

type Props = {
  view: "list" | "calendar";
  calendarViewRoute: string;
  listViewRoute: string;
  maintainQueryParams?: boolean;
};

export const ScheduleViewToggle: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  return (
    <>
      <div className={classes.option}>
        <Link
          to={
            props.maintainQueryParams
              ? `${props.listViewRoute}?${queryParams}`
              : props.listViewRoute
          }
          className={`${classes.option} ${
            props.view === "list" ? classes.selected : ""
          }`}
        >
          <ListIcon fontSize={"small"} />
          {!isMobile && (
            <Typography className={classes.buttonText}>
              {t("List View")}
            </Typography>
          )}
        </Link>
      </div>
      <div className={classes.option}>
        <Link
          to={
            props.maintainQueryParams
              ? `${props.calendarViewRoute}?${queryParams}`
              : props.calendarViewRoute
          }
          className={`${classes.option} ${
            props.view === "calendar" ? classes.selected : ""
          }`}
        >
          <CalendarTodayIcon fontSize={"small"} />
          {!isMobile && (
            <Typography className={classes.buttonText}>
              {t("Calendar View")}
            </Typography>
          )}
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

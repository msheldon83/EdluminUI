import { Grid, makeStyles, Typography, Link } from "@material-ui/core";
import { ArrowForwardIos, ArrowBackIos } from "@material-ui/icons";
import { useIsMobile, useDeferredState } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  format,
  isTomorrow,
  isToday,
  isYesterday,
  addDays,
  subDays,
  startOfToday,
} from "date-fns";
import clsx from "clsx";
import { useEffect } from "react";

type Props = {
  date: Date;
  setDate: (date: Date) => void;
};

export const DateStepperHeader: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [date, pendingDate, setPendingDate] = useDeferredState(
    props.date ?? startOfToday(),
    200
  );

  // Allow a parent to update the date within here
  useEffect(() => {
    setPendingDate(props.date);
  }, [props.date]); // eslint-disable-line react-hooks/exhaustive-deps

  // Call the function provided by the parent to push the current date setting out
  useEffect(() => {
    props.setDate(date);
  }, [date]); // eslint-disable-line react-hooks/exhaustive-deps

  let dateSubText = undefined;
  if (isYesterday(pendingDate)) {
    dateSubText = t("Yesterday");
  } else if (isToday(pendingDate)) {
    dateSubText = t("Today");
  } else if (isTomorrow(pendingDate)) {
    dateSubText = t("Tomorrow");
  }

  const goForward = () => {
    setPendingDate(addDays(pendingDate, 1));
  };

  const goBackward = () => {
    setPendingDate(subDays(pendingDate, 1));
  };

  const goToToday = () => {
    setPendingDate(startOfToday());
  };

  return (
    <div>
      <div className={classes.dayDescription}>
        <Typography variant={isMobile ? "h6" : "h5"}>
          {dateSubText ? (
            dateSubText
          ) : (
            <Link onClick={goToToday} className={classes.todayLink}>
              {t("Return to Today")}
            </Link>
          )}
        </Typography>
      </div>
      <div className={classes.dateStepper}>
        <ArrowBackIos onClick={goBackward} className={classes.arrow} />
        <div
          className={
            isMobile ? classes.dateContainerMobile : classes.dateContainer
          }
        >
          <Typography variant={isMobile ? "h5" : "h1"}>
            {format(pendingDate, "EEE',' MMM d")}
          </Typography>
        </div>
        <ArrowForwardIos
          onClick={goForward}
          className={clsx({
            [classes.arrow]: true,
            [classes.forwardArrow]: true,
          })}
        />
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  dayDescription: {
    "@media print": {
      display: "none",
    },
  },
  todayLink: {
    cursor: "pointer",
  },
  dateContainerMobile: { width: "140px" },
  dateContainer: {
    width: "280px",
  },
  dateStepper: {
    marginTop: theme.spacing(),
    display: "flex",
    alignItems: "center",
  },
  arrow: {
    fill: theme.palette.primary.main,
    cursor: "pointer",
    "@media print": {
      display: "none",
    },
  },
  forwardArrow: {
    marginLeft: theme.spacing(),
  },
}));

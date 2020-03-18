import { makeStyles, Typography } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { DateDetails } from "./types";
import { DateDetailItem } from "./date-detail-item";
import { getDateRangeDisplayTextWithDayOfWeekForContiguousDates } from "ui/components/date-helpers";

type Props = {
  dateDetails: DateDetails;
  showAbsenceTimes: boolean;
};

export const DateGroup: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { dateDetails, showAbsenceTimes } = props;

  return (
    <div className={classes.dateGroup}>
      <div className={classes.dateGroupHeader}>
        <Typography variant="h6">
          {getDateRangeDisplayTextWithDayOfWeekForContiguousDates(
            dateDetails.dates
          )}
        </Typography>
      </div>
      <div>
        {showAbsenceTimes && (
          <div>{`${dateDetails.absenceStartTime ??
            ""} - ${dateDetails.absenceEndTime ?? ""}`}</div>
        )}
        <div>
          {dateDetails.details.map((d, i) => {
            return <DateDetailItem key={i} detail={d} />;
          })}
        </div>
      </div>
    </div>
  );
};

export const useStyles = makeStyles(theme => ({
  dateGroup: {
    width: "100%",
    paddingBottom: theme.spacing(),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  dateGroupHeader: {
    marginTop: theme.spacing(2),
  },
}));

import { makeStyles } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { DateDetails } from "./types";
import { DateDetailItem } from "./date-detail-item";

type Props = {
  dateDetails: DateDetails;
  showAbsenceTimes: boolean;
};

export const DateGroup: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { dateDetails, showAbsenceTimes } = props;

  return (
    <div>
      <div>{dateDetails.dates}</div>
      <div>
        {showAbsenceTimes && (
          <div>{`${dateDetails.absenceStartTime ??
            ""} - ${dateDetails.absenceEndTime ?? ""}`}</div>
        )}
        <div>
          {dateDetails.details.map((d, i) => {
            <DateDetailItem key={i} detail={d} />;
          })}
        </div>
      </div>
    </div>
  );
};

export const useStyles = makeStyles(theme => ({}));

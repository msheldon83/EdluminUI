import { Grid, InputLabel, Button, Typography } from "@material-ui/core";
import * as React from "react";
import parseISO from "date-fns/parseISO";
import isEqual from "date-fns/isEqual";
import format from "date-fns/format";
import { useTranslation } from "react-i18next";

type Props = {
  vacancy: {
    id: string;
    vacancyDetail: {
      locationName: string;
      startTimeLocal: string | null;
      endTimeLocal: string | null;
      dayPortion: number;
    }[];
    orgName: string;
    positionTypeName: string;
    employeeName: string | null;
    startDate: string;
    endDate: string;
    notesToReplacement: string | null;
  };
  onAccept?: () => void;
};

export const AvailableJob: React.FC<Props> = props => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = React.useState(false);

  const vacancy = props.vacancy;

  const startDate = parseISO(vacancy.startDate);
  const endDate = parseISO(vacancy.endDate);
  let vacancyDates = format(startDate, "MMM d");
  let vacancyDaysOfWeek = format(startDate, "EEEE");
  if (!isEqual(startDate, endDate)) {
    vacancyDaysOfWeek = `${format(startDate, "EEE")} - ${format(
      endDate,
      "EEE"
    )}`;
    if (startDate.getMonth() === endDate.getMonth()) {
      vacancyDates = `${vacancyDates} - ${format(endDate, "d")}`;
    } else {
      vacancyDates = `${vacancyDates} - ${format(endDate, "MMM d")}`;
    }
  }

  return (
    <>
      <Grid container spacing={2}>
        <Grid item>
          <Typography variant="h6">{vacancyDates}</Typography>
          <Typography variant="h6">{vacancyDaysOfWeek}</Typography>
        </Grid>
        <Grid item>
          <Typography variant="h6">
            {vacancy.vacancyDetail[0].locationName}
          </Typography>
          <Typography variant="h6">{vacancy.orgName}</Typography>
        </Grid>
        <Grid item>
          <Typography variant="h6">{vacancy.positionTypeName}</Typography>
          <Typography variant="h6">{`for ${vacancy.employeeName}`}</Typography>
        </Grid>
        <Grid item>
          {"Day type"}
          {"Time"}
        </Grid>
        <Grid item>{"Dismiss button link"}</Grid>
        <Grid item>
          {expanded ? (
            <Button variant="contained" onClick={props.onAccept}>
              {t("Accept")}
            </Button>
          ) : (
            <Button variant="contained" onClick={() => setExpanded(!expanded)}>
              {t("View")}
            </Button>
          )}
        </Grid>
      </Grid>
    </>
  );
};

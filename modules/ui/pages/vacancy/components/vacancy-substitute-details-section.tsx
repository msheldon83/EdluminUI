import * as React from "react";
import { Grid, makeStyles, Typography, TextField } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { secondsToFormattedHourMinuteString } from "helpers/time";

export type VacancyScheduleDay = {
  date: Date;
  startTime: number;
  endTime: number;
  location: string;
  payCode: string;
  accountingCode: string;
  positionTitle?: string;
};

type Props = {
  scheduleDays: VacancyScheduleDay[];
  onNotesChange?: (notes: string) => void;
  notes?: string;
  showNotes: boolean;
};

export const VacancySubstituteDetailsSection: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const formatLabel = (d: number) => {
    return secondsToFormattedHourMinuteString(d);
  };

  const onNotesChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (props.onNotesChange) {
        props.onNotesChange(event.target.value);
      }
    },
    [props]
  );

  return (
    <>
      <Grid container className={classes.subContainer}>
        <Grid item xs={12} className={classes.vacancyDetailsHeader}>
          {t("Substitute schedule")}
        </Grid>
        {props.scheduleDays.length === 0 && (
          <Grid item xs={12} className={classes.daysPlaceHolder}>
            <Typography>{t("No days chosen")}</Typography>
          </Grid>
        )}
        {props.scheduleDays.map((sd, i) => {
          return (
            <Grid className={classes.scheduleItem} item container key={i}>
              <Grid xs={12} item>
                <Typography variant="h6">
                  {format(sd.date, "EEE, MMM d")}
                </Typography>
              </Grid>
              <Grid xs={6} item>
                <Typography>
                  {sd.startTime && sd.endTime
                    ? `${formatLabel(sd.startTime)} - ${formatLabel(
                        sd.endTime
                      )}`
                    : ""}
                </Typography>
              </Grid>
              <Grid xs={6} item>
                <Typography>{sd.location}</Typography>
              </Grid>
              <Grid xs={6} item>
                {sd.payCode ? (
                  <>{`${t("Pay")}: ${sd.payCode}`}</>
                ) : (
                  <>
                    {`${t("Pay")}: `}
                    <span className={classes.notSpecified}>
                      {t("Not Specified")}
                    </span>
                  </>
                )}
              </Grid>
              <Grid xs={6} item>
                {sd.accountingCode ? (
                  <>{`${t("Acct")}: ${sd.accountingCode}`}</>
                ) : (
                  <>
                    {`${t("Acct")}: `}
                    <span className={classes.notSpecified}>
                      {t("Not Specified")}
                    </span>
                  </>
                )}
              </Grid>
            </Grid>
          );
        })}
        {props.showNotes && (
          <>
            <Grid item xs={12} className={classes.notesLabelContainer}>
              <label>{t("Notes for substitute")}</label>
            </Grid>
            <Grid item xs={12} className={classes.notesSubLabelContainer}>
              <Typography variant="caption">
                {t(
                  "Can be seen by the substititue, administrator and employee"
                )}
              </Typography>
            </Grid>
            <Grid item xs={10} className={classes.notesContainer}>
              {props.onNotesChange && (
                <TextField
                  multiline={true}
                  value={props.notes}
                  fullWidth={true}
                  placeholder={t("Enter notes for substitute")}
                  variant="outlined"
                  onChange={onNotesChange}
                />
              )}
              {!props.onNotesChange && <Typography>{props.notes}</Typography>}
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
};
const useStyles = makeStyles(theme => ({
  subContainer: {
    border: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    "& label": {
      fontWeight: "bold",
    },
  },
  scheduleItem: {
    marginTop: theme.typography.pxToRem(15),
    marginBottom: theme.typography.pxToRem(15),
    paddingLeft: theme.typography.pxToRem(15),
  },
  fullWidth: {
    width: "100%",
  },
  vacancySummaryHeader: {
    marginBottom: theme.spacing(),
  },
  vacancyDetailsHeader: {
    backgroundColor: theme.customColors.lightGray,
    color: theme.customColors.edluminSubText,
    borderBottom: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    paddingTop: theme.spacing(),
    paddingBottom: theme.spacing(),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  detailRow: {
    paddingBottom: theme.spacing(),
  },
  daysPlaceHolder: {
    marginTop: theme.typography.pxToRem(20),
    marginBottom: theme.typography.pxToRem(20),
    paddingLeft: theme.spacing(2),
  },
  notesContainer: {
    marginTop: theme.spacing(),
    paddingLeft: theme.spacing(2),
    marginBottom: theme.typography.pxToRem(20),
  },
  notesLabelContainer: {
    paddingLeft: theme.spacing(2),
  },
  notesSubLabelContainer: {
    paddingLeft: theme.spacing(2),
    color: theme.customColors.gray,
  },
  notSpecified: {
    color: theme.customColors.edluminSubText,
  },
}));

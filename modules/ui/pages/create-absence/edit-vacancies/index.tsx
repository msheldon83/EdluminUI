import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { VacancyDisplayData } from "../ui";
import { VacancySummaryHeader } from "../vacancy-details/vacancy-summary-header";
import { Step } from "../step-params";
import { getDateRangeDisplayText, convertStringToDate } from "helpers/date";
import { Fragment } from "react";
import { format } from "date-fns";
import { groupBy } from "lodash-es";
import { VacancyDetailRow } from "../vacancy-details/vacancy-row";

type Props = {
  vacancies: VacancyDisplayData;
  actingAsEmployee?: boolean;
  positionName?: string;
  employeeName: string;
  setStep: (S: Step) => void;
};

export const EditVacancies: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const sortedVacancies = props.vacancies
    .slice()
    .sort((a, b) => a.startTimeLocal - b.startTimeLocal);
  return (
    <>
      <Typography variant={props.actingAsEmployee ? "h1" : "h5"}>
        {`${t("Create Absence")}: ${t("Editing Substitute Details")}`}
      </Typography>
      {!props.actingAsEmployee && (
        <Typography variant="h1">{props.employeeName}</Typography>
      )}

      <Section className={classes.vacancyDetails}>
        <Grid container>
          <Grid item>
            <VacancySummaryHeader
              positionName={props.positionName}
              vacancies={props.vacancies}
            />
          </Grid>
        </Grid>

        {sortedVacancies.map((v, detailsIndex) => {
          const groupedDetails = groupBy(v.details, d => {
            return d!.startTimeLocal && d!.endTimeLocal && d!.locationId;
          });

          const startDateLocal = convertStringToDate(v.startTimeLocal);
          const endDateLocal = convertStringToDate(v.endTimeLocal);
          if (!startDateLocal || !endDateLocal) {
            return;
          }

          const scheduleLetters = ["a"];
          return (
            <Grid key={detailsIndex} item container xs={12} alignItems="center">
              <Grid
                item
                // xs={props.equalWidthDetails ? 6 : 2}
              >
                <Typography variant="h6">
                  {getDateRangeDisplayText(startDateLocal, endDateLocal)}
                </Typography>
              </Grid>
              <Grid
                item
                // xs={props.equalWidthDetails ? 6 : 10}
                // className={classes.scheduleText}
              >
                {`${t("Schedule")} ${scheduleLetters[detailsIndex]}`}
              </Grid>
              {Object.entries(groupedDetails).map(
                ([key, value], groupIndex) => (
                  <Fragment key={groupIndex}>
                    <VacancyDetailRow vacancyDetails={value} />
                  </Fragment>
                )
              )}
            </Grid>
          );
        })}

        <Grid container justify="flex-end">
          <Grid item>
            <Button onClick={() => props.setStep("absence")} variant="outlined">
              {t("Cancel")}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained">{t("Save")}</Button>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  vacancyDetails: {
    marginTop: theme.spacing(3),
  },
}));

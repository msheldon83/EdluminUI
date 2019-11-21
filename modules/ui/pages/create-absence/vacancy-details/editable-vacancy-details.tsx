import { Divider, Grid, makeStyles, Typography } from "@material-ui/core";
import { Location, VacancyDetail } from "graphql/server-types.gen";
import { convertStringToDate, getDateRangeDisplayText } from "helpers/date";
import { compact, groupBy } from "lodash-es";
import * as React from "react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { CreateAbsenceFormData } from "../ui";
import { EditableVacancyDetailRow } from "./editable-vacancy-row";
import { VacancySummaryHeader } from "./vacancy-summary-header";
import { Register, SetValue } from "forms";
import { Vacancy } from "graphql/server-types.gen";

type Props = {
  vacancies: Vacancy[];
  positionName?: string | null | undefined;
  showHeader?: boolean;
  equalWidthDetails?: boolean;
  gridRef?: React.RefObject<HTMLDivElement>;
  locationOptions: Location[];
  setValue: SetValue;
  register: Register;
  values: CreateAbsenceFormData;
};

export const EditableVacancyDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  if (!props.vacancies || !props.vacancies.length) {
    return <></>;
  }

  const sortedVacancies = props.vacancies
    .slice()
    .sort((a, b) => a.startTimeLocal - b.startTimeLocal);

  return (
    <Grid container spacing={2} ref={props.gridRef || null}>
      {props.showHeader && (
        <Grid item xs={12}>
          <VacancySummaryHeader
            positionName={props.positionName}
            vacancies={props.vacancies}
          />
          <Divider className={classes.divider} />
        </Grid>
      )}

      {sortedVacancies.map((v: Vacancy, detailsIndex) => {
        const groupedDetails = groupBy<VacancyDetail>(compact(v.details), d => {
          return d.startTimeLocal && d.endTimeLocal && d.locationId;
        });

        const startDateLocal = convertStringToDate(v.startTimeLocal);
        const endDateLocal = convertStringToDate(v.endTimeLocal);
        if (!startDateLocal || !endDateLocal) {
          return;
        }

        return (
          <Grid key={detailsIndex} item container xs={12} alignItems="center">
            <Grid item xs={12}>
              <Typography variant="h6">
                {getDateRangeDisplayText(startDateLocal, endDateLocal)}
              </Typography>
            </Grid>

            {Object.entries(groupedDetails).map(([key, value], groupIndex) => (
              <Fragment key={groupIndex}>
                <EditableVacancyDetailRow
                  vacancyDetails={value}
                  groupIndex={groupIndex}
                  equalWidthDetails={props.equalWidthDetails}
                  locationOptions={props.locationOptions}
                  setValue={props.setValue}
                  register={props.register}
                  values={props.values}
                />
              </Fragment>
            ))}
          </Grid>
        );
      })}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  divider: {
    marginTop: theme.spacing(3),
  },
  scheduleText: {
    color: "#9E9E9E",
  },
  vacancyBlockItem: {
    marginTop: theme.spacing(0.5),
  },
}));

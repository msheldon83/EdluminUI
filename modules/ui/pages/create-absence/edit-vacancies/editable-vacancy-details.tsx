import { Divider, Grid, makeStyles } from "@material-ui/core";
import { Register, SetValue } from "forms";
import { Location, Vacancy } from "graphql/server-types.gen";
import * as React from "react";
import { Fragment } from "react";
import { getVacancyDetailsGrouping } from "ui/components/absence/helpers";
import { EditVacancyFormData } from ".";
import { VacancySummaryHeader } from "../../../components/absence/vacancy-summary-header";
import { EditableVacancyDetailGroup } from "./editable-vacancy-details-group";

type Props = {
  vacancies: Vacancy[];
  positionName?: string | null | undefined;
  showHeader?: boolean;
  equalWidthDetails?: boolean;
  gridRef?: React.RefObject<HTMLDivElement>;
  locationOptions: Location[];
  setValue: SetValue;
  register: Register;
  values: EditVacancyFormData;
};

export const EditableVacancyDetails: React.FC<Props> = props => {
  const classes = useStyles();
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
      {sortedVacancies.map(v => {
        if (v.details && v.details.length) {
          const groupedDetails = getVacancyDetailsGrouping(v.details);
          if (groupedDetails === null || !groupedDetails.length) {
            return <></>;
          }
          return groupedDetails.map((details, detailsIndex) => (
            <Fragment key={detailsIndex}>
              <EditableVacancyDetailGroup
                {...props}
                detailsIndex={detailsIndex}
                detailGroup={details}
                values={props.values.vacancies[detailsIndex]}
              />
            </Fragment>
          ));
        }
      })}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  divider: {
    marginTop: theme.spacing(3),
  },
}));

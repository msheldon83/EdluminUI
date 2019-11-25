import { Grid, Typography } from "@material-ui/core";
import { Register, SetValue } from "forms";
import { Location } from "graphql/server-types.gen";
import { getDateRangeDisplayText } from "helpers/date";
import * as React from "react";
import { Fragment } from "react";
import { VacancyDetailsGroup } from "ui/components/absence/helpers";
import { EditVacancyFormData } from ".";
import { EditableVacancyDetailRow } from "./editable-vacancy-row";

type Props = {
  detailGroup: VacancyDetailsGroup;
  equalWidthDetails?: boolean;
  locationOptions: Location[];
  setValue: SetValue;
  detailsIndex: number;
  values: EditVacancyFormData;
  register: Register;
};

export const EditableVacancyDetailGroup: React.FC<Props> = props => {
  return (
    <Grid key={props.detailsIndex} item container xs={12} alignItems="center">
      <Grid item xs={props.equalWidthDetails ? 6 : 2}>
        <Typography variant="h6">
          {getDateRangeDisplayText(
            props.detailGroup.startDate,
            props.detailGroup.endDate ?? new Date()
          )}
        </Typography>
      </Grid>

      {props.detailGroup.simpleDetailItems!.map((detailItem, i) => (
        <Fragment key={i}>
          <EditableVacancyDetailRow
            {...props}
            detailIndex={i}
            details={detailItem}
          />
        </Fragment>
      ))}
    </Grid>
  );
};

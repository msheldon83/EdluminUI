import * as React from "react";
import { Grid } from "@material-ui/core";
import { convertStringToDate, getDateRangeDisplayText } from "helpers/date";
import { AbsVacLink } from "ui/components/links/abs-vac";
import { AbsVac } from "./types";

export const DeleteDialogRow: React.FC<AbsVac> = ({
  id,
  startDate,
  endDate,
  type,
}) => {
  const dateRangeDisplay = getDateRangeDisplayText(
    startDate ? convertStringToDate(startDate) : null,
    endDate ? convertStringToDate(endDate) : null
  );
  return (
    <>
      <Grid item xs={6}>
        {dateRangeDisplay}
      </Grid>
      <Grid item xs={6}>
        <AbsVacLink absVacId={id} absVacType={type} target="_blank" />
      </Grid>
    </>
  );
};

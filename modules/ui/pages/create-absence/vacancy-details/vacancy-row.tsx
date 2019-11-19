import { Grid, makeStyles } from "@material-ui/core";
import { format } from "date-fns";
import { VacancyDetail, Maybe } from "graphql/server-types.gen";
import { convertStringToDate } from "helpers/date";
import * as React from "react";

type Props = {
  vacancyDetails: Maybe<VacancyDetail>[];
  equalWidthDetails?: boolean;
};

export const VacancyDetailRow: React.FC<Props> = props => {
  const classes = useStyles();

  const firstDetail = props.vacancyDetails[0];
  if (!firstDetail) {
    return <></>;
  }

  const detailStartTimeLocal = convertStringToDate(firstDetail.startTimeLocal);
  const detailEndTimeLocal = convertStringToDate(firstDetail.endTimeLocal);
  if (!detailStartTimeLocal || !detailEndTimeLocal) {
    return <></>;
  }

  return (
    <>
      <Grid
        item
        xs={props.equalWidthDetails ? 6 : 2}
        className={classes.vacancyBlockItem}
      >
        {`${format(detailStartTimeLocal, "h:mm a")} - ${format(
          detailEndTimeLocal,
          "h:mm a"
        )}`}
      </Grid>
      <Grid
        item
        xs={props.equalWidthDetails ? 6 : 10}
        className={classes.vacancyBlockItem}
      >
        {firstDetail.location
          ? firstDetail.location.name
          : firstDetail.locationId}
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  vacancyBlockItem: {
    marginTop: theme.spacing(0.5),
  },
}));

import * as React from "react";
import { Grid, Typography } from "@material-ui/core";
import { DeleteDialogRow } from "./row";
import { AbsVac } from "./types";

type Props = {
  employeeType: string;
  absvacType: string;
  absvacs: AbsVac[] | undefined;
};

export const DeleteDialogList: React.FC<Props> = ({
  employeeType,
  absvacType,
  absvacs,
}) => {
  return absvacs && absvacs.length > 0 ? (
    <Grid container>
      {absvacs.map(absvac => (
        <Grid item container key={absvac.id}>
          <DeleteDialogRow {...absvac} />
        </Grid>
      ))}
    </Grid>
  ) : (
    <Typography>{`This ${employeeType} has no upcoming ${absvacType}`}</Typography>
  );
};

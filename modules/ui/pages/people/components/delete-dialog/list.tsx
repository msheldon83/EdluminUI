import * as React from "react";
import { Grid } from "@material-ui/core";
import { DeleteDialogRow } from "./row";
import { AbsVac } from "./types";

type Props = {
  absvacs: AbsVac[];
};

export const DeleteDialogList: React.FC<Props> = ({ absvacs }) => {
  return (
    <Grid container>
      {absvacs.map(absvac => (
        <Grid item container key={absvac.id}>
          <DeleteDialogRow absvac={absvac} />
        </Grid>
      ))}
    </Grid>
  );
};

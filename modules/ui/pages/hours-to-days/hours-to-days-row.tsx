import * as React from "react";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { FormikTimeInput } from "ui/components/form/formik-time-input";
import { Input } from "ui/components/form/input";
import { TextField as FormTextField } from "ui/components/form/text-field";

type Props = {
  time: Date | string;
  name: string;
  dayFraction: number;
  className?: string;
  keyPrefix: string;
};

export const HoursToDaysRow: React.FC<Props> = ({
  time,
  name,
  dayFraction,
  className,
  keyPrefix,
}) => {
  const classes = useStyles();
  return (
    <Grid item container xs={12} className={className}>
      <Grid item xs={4} className={classes.rowCell}>
        {typeof time !== "string" && (
          <FormikTimeInput name={`${keyPrefix}.time`} date={time} />
        )}
        {typeof time === "string" && <span>{time}</span>}
      </Grid>
      <Grid item xs={4} className={classes.rowCell}>
        <Input
          value={name}
          InputComponent={FormTextField}
          inputComponentProps={{
            name: "phoneNumber",
            id: "phoneNumber",
          }}
        />
      </Grid>
      <Grid item xs={4} className={classes.rowCell}>
        <FormTextField name={`${keyPrefix}.dayFraction`} fullWidth />
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  rowCell: {
    paddingRight: "10%",
  },
}));

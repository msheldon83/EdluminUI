import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, IconButton, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { HighlightOff } from "@material-ui/icons";
import { useField } from "formik";
import { FormikDurationInput } from "ui/components/form/formik-duration-input";
import { ClearedInput } from "./cleared-input";

type Props = {
  keyPrefix: string;
  className?: string;
  headerText?: string;
  deleteThisRow?: () => void;
};

export const HoursToDaysRow: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [minutesField, minutesMeta] = useField(`${props.keyPrefix}.maxMinutes`);

  return (
    <Grid
      item
      container
      xs={12}
      className={props.className}
      alignItems="center"
    >
      <Grid item xs={1}>
        {props.deleteThisRow && (
          <IconButton aria-label="delete" onClick={props.deleteThisRow}>
            <HighlightOff />
          </IconButton>
        )}
      </Grid>
      <Grid item xs={3} className={classes.rowCell}>
        {!props.headerText && (
          <FormikDurationInput
            placeholder={t("hh:mm")}
            name={`${props.keyPrefix}.maxMinutes`}
            inputStatus={"formik"}
            alwaysTouched
          />
        )}
        {props.headerText && <Typography>{props.headerText}</Typography>}
      </Grid>
      <Grid item xs={4} className={classes.rowCell}>
        <ClearedInput
          className={classes.textInput}
          name={`${props.keyPrefix}.name`}
        />
      </Grid>
      <Grid item xs={4} className={classes.rowCell}>
        <ClearedInput
          className={classes.textInput}
          name={`${props.keyPrefix}.dayEquivalent`}
        />
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  rowCell: {
    paddingRight: theme.spacing(4),
  },
  textInput: {
    backgroundColor: theme.customColors.white,
  },
}));

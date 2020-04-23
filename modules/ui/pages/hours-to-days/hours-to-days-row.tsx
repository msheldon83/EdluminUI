import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Delete } from "@material-ui/icons";
import { FormikErrors } from "formik";
import { Input } from "ui/components/form/input";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { FormikDurationInput } from "ui/components/form/formik-duration-input";

type Props = {
  name: string;
  dayEquivalent: number;
  className?: string;
  keyPrefix: string;
  headerText?: string;
  error?: FormikErrors<{
    maxMinutes: number;
    name: string;
    dayEquivalent: number;
  }>;
  deleteThisRow?: () => void;
};

export const HoursToDaysRow: React.FC<Props> = ({
  name,
  dayEquivalent,
  className,
  keyPrefix,
  headerText,
  error,
  deleteThisRow,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Grid item container xs={12} className={className}>
      <Grid item xs={1}>
        {deleteThisRow && (
          <IconButton aria-label="delete" onClick={deleteThisRow}>
            <Delete />
          </IconButton>
        )}
      </Grid>
      <Grid item xs={3} className={classes.rowCell}>
        {!headerText && (
          <FormikDurationInput
            placeholder={t("hh:mm")}
            name={`${keyPrefix}.maxMinutes`}
            inputStatus={error?.maxMinutes ? "error" : "default"}
            validationMessage={error?.maxMinutes}
          />
        )}
        {headerText && <span>{headerText}</span>}
      </Grid>
      <Grid item xs={4} className={classes.rowCell}>
        <Input
          InputComponent={FormTextField}
          inputComponentProps={{
            name: `${keyPrefix}.name`,
            id: `${keyPrefix}.name`,
            fullWidth: true,
            className: classes.textInput,
          }}
        />
      </Grid>
      <Grid item xs={4} className={classes.rowCell}>
        <Input
          InputComponent={FormTextField}
          inputComponentProps={{
            name: `${keyPrefix}.dayEquivalent`,
            id: `${keyPrefix}.dayEquivalent`,
            fullWidth: true,
            className: classes.textInput,
          }}
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

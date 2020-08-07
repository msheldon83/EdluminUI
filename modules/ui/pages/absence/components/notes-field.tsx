import { makeStyles, TextField, Typography } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { TextButton } from "ui/components/text-button";
import { isEmpty, words } from "lodash-es";

type Props = {
  name: string;
  value: string | undefined;
  onChange: (event: any) => Promise<void>;
  initialAbsenceCreation: boolean;
  isSubmitted: boolean;
  validationMessage?: string | undefined;
  required?: boolean;
};

export const NoteField: React.FC<Props> = props => {
  const classes = useStyles();
  const textFieldClasses = useTextFieldClasses();
  const { t } = useTranslation();

  const [isEditingNotes, setIsEditingNotes] = React.useState(false);

  React.useEffect(() => {
    const emptyNotes = isEmpty(words(props.value));

    if (emptyNotes) {
      setIsEditingNotes(true);
      return;
    }

    if (props.isSubmitted) {
      setIsEditingNotes(false);
    }
  }, [props.isSubmitted, props.value]);

  const requireNotes =
    (props.required && isEmpty(words(props.value))) ||
    !!props.validationMessage;
  const requiredText = requireNotes ? t("Required") : props.validationMessage;

  return (
    <>
      {isEditingNotes || props.initialAbsenceCreation ? (
        <TextField
          name={props.name}
          value={props.value}
          multiline
          rows="6"
          variant="outlined"
          margin="normal"
          fullWidth
          onChange={props.onChange}
          InputProps={{ classes: textFieldClasses }}
          error={requireNotes}
          helperText={requiredText}
        />
      ) : (
        <div className={classes.readonlyNotes}>
          <Typography display="inline">{props.value}</Typography>
          <TextButton onClick={() => setIsEditingNotes(true)}>
            {t("Edit")}
          </TextButton>
        </div>
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  readonlyNotes: { paddingTop: theme.spacing(2) },
}));

const useTextFieldClasses = makeStyles(theme => ({
  multiline: {
    padding: theme.spacing(1),
  },
}));

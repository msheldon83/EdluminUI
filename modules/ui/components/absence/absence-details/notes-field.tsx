import {
  makeStyles,
  TextField,
  TextFieldProps,
  Typography,
} from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { TextButton } from "ui/components/text-button";

type Props = {
  name: string;
  value: string | undefined;
  onChange: (event: any) => Promise<void>;
  initialAbsenceCreation: boolean;
  isSubmitted: boolean;
} & TextFieldProps;

export const NoteField: React.FC<Props> = props => {
  const classes = useStyles();
  const textFieldClasses = useTextFieldClasses();
  const { t } = useTranslation();

  const [isEditingNotes, setIsEditingNotes] = React.useState(false);

  React.useEffect(() => {
    if (props.isSubmitted) {
      setIsEditingNotes(false);
    }
  }, [props.isSubmitted]);

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
          // {...props}
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

import {
  Button,
  makeStyles,
  TextField,
  Typography,
  Chip,
} from "@material-ui/core";
import { SetValue } from "forms";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { VacancyDetails } from "../vacancy-details";
import { Step } from "../step-params";
import { Vacancy } from "graphql/server-types.gen";

type Props = {
  setValue: SetValue;
  replacementEmployeeName?: string;
  replacementEmployeeId?: number;
  vacancies: Vacancy[];
  setStep: (S: Step) => void;
};

export const SubstituteRequiredDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const textFieldClasses = useTextFieldClasses();
  const { t } = useTranslation();

  const { setValue, vacancies, setStep } = props;

  const onNotesToReplacementChange = React.useCallback(
    async event => {
      await setValue("notesToReplacement", event.target.value);
    },
    [setValue]
  );

  const removePrearrangedReplacementEmployee = async () => {
    await setValue("replacementEmployeeId", undefined);
    await setValue("replacementEmployeeName", undefined);
  };

  return (
    <>
      <VacancyDetails vacancies={vacancies} equalWidthDetails />

      <div className={classes.notesForReplacement}>
        <Typography variant="h6">{t("Notes for substitute")}</Typography>
        <Typography
          className={[classes.subText, classes.substituteDetailsSubtitle].join(
            " "
          )}
        >
          {t("Can be seen by the substitute, administrator and employee.")}
        </Typography>
        <TextField
          name="notesToReplacement"
          multiline
          rows="6"
          variant="outlined"
          margin="normal"
          fullWidth
          onChange={onNotesToReplacementChange}
          InputProps={{ classes: textFieldClasses }}
        />
      </div>

      {props.replacementEmployeeId && props.replacementEmployeeName && (
        <div className={classes.preArrangedChip}>
          <Chip
            label={`${t("Pre-arranged")}: ${props.replacementEmployeeName}`}
            color={"primary"}
            onDelete={async () => {
              await removePrearrangedReplacementEmployee();
            }}
          />
        </div>
      )}

      <div>
        <Button variant="outlined" onClick={() => setStep("preAssignSub")}>
          {t("Pre-arrange")}
        </Button>

        <Button variant="outlined" onClick={() => setStep("edit")}>
          {t("Edit")}
        </Button>
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  subText: {
    color: theme.customColors.darkGray,
  },
  substituteDetailsSubtitle: { paddingBottom: theme.typography.pxToRem(1) },
  container: {
    padding: theme.spacing(2),
  },
  notesForReplacement: {
    paddingTop: theme.spacing(3),
  },
  preArrangedChip: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const useTextFieldClasses = makeStyles(theme => ({
  multiline: {
    padding: theme.spacing(1),
  },
}));

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
} from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";
import { TextButton } from "ui/components/text-button";
import { makeStyles } from "@material-ui/styles";

type Props = {
  objectType: "absence" | "vacancy";
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  replacementEmployeeNames?: string[];
};

export const DeleteAbsenceVacancyDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle disableTypography>
        <Typography variant="h5">
          {props.objectType === "absence"
            ? t("Delete Absence")
            : t("Delete Vacancy")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          {props.objectType === "absence"
            ? t("Are you sure you would like to delete this absence?")
            : t("Are you sure you would like to delete this vacancy?")}
        </Typography>
        {props.replacementEmployeeNames &&
          props.replacementEmployeeNames.length === 1 && (
            <Typography className={classes.removeSub}>
              {t(
                "The assignment filled by {{replacement}} will be cancelled.",
                {
                  replacement: props.replacementEmployeeNames,
                }
              )}
            </Typography>
          )}
        {props.replacementEmployeeNames &&
          props.replacementEmployeeNames.length > 1 && (
            <Typography className={classes.removeSub}>
              {t(
                "The assignments filled by {{replacement}} will be cancelled.",
                {
                  replacement: props.replacementEmployeeNames.join(", "),
                }
              )}
            </Typography>
          )}
      </DialogContent>

      <Divider className={classes.divider} />
      <DialogActions>
        <TextButton onClick={props.onClose} className={classes.buttonSpacing}>
          {t("No, go back")}
        </TextButton>
        <ButtonDisableOnClick
          variant="outlined"
          onClick={props.onDelete}
          className={classes.delete}
        >
          {t("Delete")}
        </ButtonDisableOnClick>
      </DialogActions>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({
  buttonSpacing: {
    paddingRight: theme.spacing(2),
  },
  removeSub: {
    paddingTop: theme.spacing(2),
    fontWeight: theme.typography.fontWeightMedium,
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(2),
  },
  delete: { color: theme.customColors.darkRed },
}));
